import type { Db } from 'mongodb';
import { z } from 'zod';
import { getDb } from '@/lib/mongodb';
import { visitorIdSchema } from '@/lib/entries/input';
import { issuesFrom, type WriteFailure } from '@/lib/entries/results';
import { createEntryStore } from '@/lib/entries/store';
import type { PublicEntry } from '@/lib/entries/documents';
import { ratingSchema } from '@/lib/schema/reaction';

const target = { visitorId: visitorIdSchema, entryId: z.string().min(1).max(120) };

/** null or false clears the reaction. */
export const reactionInputSchema = z.discriminatedUnion('kind', [
  z.object({ ...target, kind: z.literal('rate'), value: ratingSchema.nullable() }),
  z.object({ ...target, kind: z.literal('save'), value: z.boolean() }),
  z.object({ ...target, kind: z.literal('hide'), value: z.boolean() }),
]);

export interface ReactionView {
  rating: { average: number | null; count: number };
  mine: { rating: number | null; saved: boolean; hidden: boolean };
}

export type ReactionResult = { kind: 'saved'; view: ReactionView } | WriteFailure;

export function createReactionStore(db: Db) {
  const reactions = db.collection('reactions');
  const entryStore = createEntryStore(db);

  async function entryIdsOf(visitorId: string | null, kind: 'save' | 'hide'): Promise<string[]> {
    if (!visitorId) return [];
    const docs = await reactions
      .find({ visitorId, kind }, { projection: { entryId: 1 } })
      .sort({ updatedAt: -1 })
      .toArray();
    return docs.map((doc) => String(doc.entryId));
  }

  async function ratingsAndMine(entryId: string, visitorId: string | null): Promise<ReactionView> {
    const [ratings, mine] = await Promise.all([
      reactions
        .aggregate<{ average: number; count: number }>([
          { $match: { entryId, kind: 'rate' } },
          { $group: { _id: null, average: { $avg: '$value' }, count: { $sum: 1 } } },
        ])
        .toArray(),
      visitorId ? reactions.find({ entryId, visitorId }).toArray() : [],
    ]);
    const byKind = new Map(mine.map((doc) => [doc.kind as string, doc.value]));
    const rating = byKind.get('rate');
    return {
      rating: {
        average: ratings[0] ? Math.round(ratings[0].average * 10) / 10 : null,
        count: ratings[0]?.count ?? 0,
      },
      mine: {
        rating: typeof rating === 'number' ? rating : null,
        saved: byKind.has('save'),
        hidden: byKind.has('hide'),
      },
    };
  }

  return {
    /** Null when the entry is not public. */
    async view(entryId: string, visitorId: string | null): Promise<ReactionView | null> {
      return (await entryStore.getLive(entryId)) ? ratingsAndMine(entryId, visitorId) : null;
    },

    hiddenEntryIds: (visitorId: string | null) => entryIdsOf(visitorId, 'hide'),

    /** Live entries the visitor saved or hid, most recent first. */
    async listForVisitor(visitorId: string | null): Promise<{ saved: PublicEntry[]; hidden: PublicEntry[] }> {
      const [savedIds, hiddenIds] = await Promise.all([entryIdsOf(visitorId, 'save'), entryIdsOf(visitorId, 'hide')]);
      const [saved, hidden] = await Promise.all([
        savedIds.length ? entryStore.listLive({ ids: savedIds }) : [],
        hiddenIds.length ? entryStore.listLive({ ids: hiddenIds }) : [],
      ]);
      const inOrder = (ids: string[], entries: PublicEntry[]) =>
        ids.flatMap((id) => entries.filter((entry) => entry.id === id));
      return { saved: inOrder(savedIds, saved), hidden: inOrder(hiddenIds, hidden) };
    },

    async set(raw: unknown, now = new Date()): Promise<ReactionResult> {
      const parsed = reactionInputSchema.safeParse(raw);
      if (!parsed.success) {
        return { kind: 'invalid', issues: issuesFrom(parsed.error) };
      }
      const { visitorId, entryId, kind, value } = parsed.data;
      if (!(await entryStore.getLive(entryId))) {
        return { kind: 'notFound' };
      }

      const key = { entryId, visitorId, kind };
      if (value === null || value === false) {
        await reactions.deleteOne(key);
      } else {
        await reactions.updateOne(
          key,
          { $set: { value, updatedAt: now }, $setOnInsert: { createdAt: now }, $unset: { legacyType: '' } },
          { upsert: true }
        );
      }
      return { kind: 'saved', view: await ratingsAndMine(entryId, visitorId) };
    },
  };
}

export type ReactionStore = ReturnType<typeof createReactionStore>;

export async function getReactionStore(): Promise<ReactionStore> {
  return createReactionStore(await getDb());
}
