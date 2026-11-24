import type { Db, Document } from 'mongodb';
import { z } from 'zod';
import { getDb } from '@/lib/mongodb';
import { checkContent } from '@/lib/guardrails/checkContent';
import { FIELD_LIMITS } from '@/lib/guardrails/limits';
import { checkRateLimit, recordRateLimitEvent } from '@/lib/guardrails/rateLimit';
import { isDuplicateKeyError, setAndUnset } from '@/lib/entries/documents';
import { optionalText, visitorIdSchema } from '@/lib/entries/input';
import { issuesFrom, type FieldIssue, type WriteFailure } from '@/lib/entries/results';
import { createEntryStore } from '@/lib/entries/store';
import { chainEntrySchema, generationBandSchema, type ChainEntry, type GenerationBand } from '@/lib/schema/chainEntry';
import { regionSchema, type EntryStatus, type Region } from '@/lib/schema/common';
import { chainOutcome, emptyTally, type ChainTally } from './tally';

const blankToUndefined = (value: unknown) => (value === '' ? undefined : value);
const PREVIOUS_STORIES_COMPARED = 5;
const STORIES_SHOWN = 50;

export const chainAnswerInputSchema = z.object({
  visitorId: visitorIdSchema,
  entryId: z.string().min(1).max(120),
  passedDown: z.boolean(),
  kept: z.boolean(),
  storyText: optionalText(FIELD_LIMITS.chainText),
  name: optionalText(FIELD_LIMITS.postedBy),
  region: z.preprocess(blankToUndefined, regionSchema.optional()),
  generationBand: z.preprocess(blankToUndefined, generationBandSchema.optional()),
});

/** A story as anyone can see it. Built field by field so nothing private rides along. */
export interface PublicChainStory {
  id: string;
  passedDown: boolean;
  kept: boolean;
  text: string;
  name?: string;
  region?: Region;
  generationBand?: GenerationBand;
  updatedAt: Date;
}

export interface MyChainAnswer {
  passedDown: boolean;
  kept: boolean;
  storyText?: string;
  name?: string;
  region?: Region;
  generationBand?: GenerationBand;
  status: EntryStatus;
}

export interface ChainView {
  tally: ChainTally;
  stories: PublicChainStory[];
  mine: MyChainAnswer | null;
}

export type ChainResult = { kind: 'saved'; view: ChainView } | WriteFailure;

function parseChainDocs(docs: Document[]): ChainEntry[] {
  return docs.flatMap((doc) => {
    const parsed = chainEntrySchema.safeParse(doc);
    return parsed.success ? [parsed.data] : [];
  });
}

function toPublicStory(chain: ChainEntry & { story: NonNullable<ChainEntry['story']> }): PublicChainStory {
  return {
    id: chain.id,
    passedDown: chain.passedDown,
    kept: chain.kept,
    text: chain.story.text,
    name: chain.story.name,
    region: chain.region,
    generationBand: chain.generationBand,
    updatedAt: chain.updatedAt,
  };
}

function toMine(chain: ChainEntry): MyChainAnswer {
  return {
    passedDown: chain.passedDown,
    kept: chain.kept,
    storyText: chain.story?.text,
    name: chain.story?.name,
    region: chain.region,
    generationBand: chain.generationBand,
    status: chain.status,
  };
}

function guardrailIssues(messages: string[]): FieldIssue[] {
  return [...new Set(messages)].map((message) => ({ field: 'storyText', message }));
}

export function createChainStore(db: Db) {
  const chainEntries = db.collection('chainEntries');
  const entryStore = createEntryStore(db);

  async function tallyAndStories(entryId: string, visitorId: string | null): Promise<ChainView> {
    const [cells, storyDocs, mineDoc] = await Promise.all([
      chainEntries
        .aggregate<{ _id: { passedDown: boolean; kept: boolean }; count: number }>([
          { $match: { entryId, passedDown: { $type: 'bool' }, kept: { $type: 'bool' } } },
          { $group: { _id: { passedDown: '$passedDown', kept: '$kept' }, count: { $sum: 1 } } },
        ])
        .toArray(),
      chainEntries
        .find({ entryId, status: 'live', story: { $exists: true } })
        .sort({ updatedAt: -1 })
        .limit(STORIES_SHOWN)
        .toArray(),
      visitorId ? chainEntries.findOne({ entryId, visitorId }) : null,
    ]);

    const tally = emptyTally();
    for (const cell of cells) {
      tally[chainOutcome(cell._id.passedDown, cell._id.kept)] += cell.count;
    }
    const stories = parseChainDocs(storyDocs).flatMap((chain) =>
      chain.story ? [toPublicStory({ ...chain, story: chain.story })] : []
    );
    const [mine] = mineDoc ? parseChainDocs([mineDoc]) : [];
    return { tally, stories, mine: mine ? toMine(mine) : null };
  }

  /**
   * The chain under a live entry, or null when the entry is not public. Moderation status gates
   * the story only: a yes or no answer carries no text, so it always counts in the tally.
   */
  async function view(entryId: string, visitorId: string | null): Promise<ChainView | null> {
    if (!(await entryStore.getLive(entryId))) return null;
    return tallyAndStories(entryId, visitorId);
  }

  async function answer(raw: unknown, now = new Date()): Promise<ChainResult> {
    const parsed = chainAnswerInputSchema.safeParse(raw);
    if (!parsed.success) {
      return { kind: 'invalid', issues: issuesFrom(parsed.error) };
    }
    const { visitorId, entryId, storyText, name, ...fields } = parsed.data;
    if (!(await entryStore.getLive(entryId))) {
      return { kind: 'notFound' };
    }

    const key = { entryId, visitorId };
    const existingDoc = await chainEntries.findOne(key);
    const [existing] = existingDoc ? parseChainDocs([existingDoc]) : [];
    const story = storyText ? { text: storyText, name } : undefined;
    const storyChanged = story !== undefined && (story.text !== existing?.story?.text || story.name !== existing?.story?.name);

    if (storyChanged) {
      const previous = parseChainDocs(
        await chainEntries
          .find({ visitorId, entryId: { $ne: entryId }, story: { $exists: true } })
          .sort({ updatedAt: -1 })
          .limit(PREVIOUS_STORIES_COMPARED)
          .toArray()
      );
      const check = checkContent({
        contentType: 'chainStory',
        fields: { chainText: story.text, postedBy: story.name },
        previousPosts: previous.flatMap((chain) => (chain.story ? [chain.story.text] : [])),
      });
      if (check.result !== 'passed') {
        return { kind: 'rejected', guardrail: check.result, issues: guardrailIssues(check.matches.map((m) => m.message)) };
      }
    }

    // Each visitor holds at most one story per entry, so only a new story costs against the limit.
    // Rewording your own story is checked by the guardrails above but never throttled.
    const isNewStory = story !== undefined && existing?.story === undefined;
    if (isNewStory) {
      const limit = await checkRateLimit(db, visitorId, 'chainStory', now);
      if (!limit.allowed) {
        return { kind: 'rateLimited', retryAfter: limit.retryAfter, message: limit.reason ?? 'Please slow down.' };
      }
    }

    const update = setAndUnset({ ...fields, story, updatedAt: now });
    const insertOnly = chainEntrySchema.pick({ id: true, status: true, flagCount: true, createdAt: true }).parse({
      id: crypto.randomUUID(),
      status: 'live',
      flagCount: 0,
      createdAt: now,
    });
    const upsert = () =>
      chainEntries.updateOne(key, { ...update, $setOnInsert: { ...key, ...insertOnly } }, { upsert: true });

    try {
      await upsert();
    } catch (error) {
      if (!isDuplicateKeyError(error)) throw error;
      await upsert();
    }
    if (isNewStory) {
      await recordRateLimitEvent(db, visitorId, 'chainStory', now);
    }

    return { kind: 'saved', view: await tallyAndStories(entryId, visitorId) };
  }

  return { view, answer };
}

export type ChainStore = ReturnType<typeof createChainStore>;

export async function getChainStore(): Promise<ChainStore> {
  return createChainStore(await getDb());
}
