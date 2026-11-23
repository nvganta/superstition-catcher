import type { Db, Filter, Document } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import type { Category } from '@/lib/schema/category';
import type { Region } from '@/lib/schema/common';
import type { Entry } from '@/lib/schema/entry';
import { postCommunityEntry } from './community';
import { createCuratedEntry, updateEntry } from './curated';
import { parseCategoryDocs, parseEntryDocs, parsePublicEntryDocs, type PublicEntry } from './documents';

const LIVE = { status: 'live' } as const;
const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 100;

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function createEntryStore(db: Db) {
  const entries = db.collection('entries');

  return {
    async listLive(filter: { region?: Region; categorySlug?: string } = {}): Promise<PublicEntry[]> {
      const query: Filter<Document> = { ...LIVE };
      if (filter.region) query.region = filter.region;
      if (filter.categorySlug) query.categorySlugs = filter.categorySlug;
      return parsePublicEntryDocs(await entries.find(query).sort({ createdAt: -1, id: 1 }).toArray());
    },

    async getLive(id: string): Promise<PublicEntry | null> {
      const doc = await entries.findOne({ ...LIVE, id });
      return doc ? (parsePublicEntryDocs([doc])[0] ?? null) : null;
    },

    async search(rawQuery: string, limit = 8): Promise<PublicEntry[]> {
      const query = rawQuery.trim().slice(0, MAX_QUERY_LENGTH);
      if (query.length < MIN_QUERY_LENGTH) {
        return [];
      }

      const prefix = new RegExp(`(^|\\s)${escapeRegex(query)}`, 'i');
      const [textDocs, prefixDocs] = await Promise.all([
        entries
          .find({ ...LIVE, $text: { $search: query } }, { projection: { score: { $meta: 'textScore' } } })
          .sort({ score: { $meta: 'textScore' } })
          .limit(limit)
          .toArray(),
        entries
          .find({ ...LIVE, $or: [{ title: prefix }, { country: prefix }] })
          .sort({ title: 1 })
          .limit(limit)
          .toArray(),
      ]);

      const byId = new Map<string, PublicEntry>();
      for (const entry of parsePublicEntryDocs([...textDocs, ...prefixDocs])) {
        if (!byId.has(entry.id)) byId.set(entry.id, entry);
      }
      return [...byId.values()].slice(0, limit);
    },

    async entryOfTheDay(date = new Date()): Promise<PublicEntry | null> {
      const count = await entries.countDocuments(LIVE);
      if (count === 0) {
        return null;
      }
      const dayNumber = Math.floor(date.getTime() / DAY_MS);
      const docs = await entries.find(LIVE).sort({ id: 1 }).skip(dayNumber % count).limit(1).toArray();
      return parsePublicEntryDocs(docs)[0] ?? null;
    },

    async listRelated(entry: PublicEntry, limit = 3): Promise<PublicEntry[]> {
      const docs = await entries
        .find({
          ...LIVE,
          id: { $ne: entry.id },
          $or: [{ categorySlugs: { $in: entry.categorySlugs } }, { region: entry.region }],
        })
        .sort({ createdAt: -1, id: 1 })
        .limit(limit)
        .toArray();
      return parsePublicEntryDocs(docs);
    },

    async listCategories(): Promise<Category[]> {
      return parseCategoryDocs(await db.collection('categories').find({}).sort({ sortOrder: 1 }).toArray());
    },

    async liveCountsByCategory(): Promise<Record<string, number>> {
      const rows = await entries
        .aggregate<{ _id: string; count: number }>([
          { $match: LIVE },
          { $unwind: '$categorySlugs' },
          { $group: { _id: '$categorySlugs', count: { $sum: 1 } } },
        ])
        .toArray();
      return Object.fromEntries(rows.map((row) => [row._id, row.count]));
    },

    async listAllForAdmin(): Promise<Entry[]> {
      return parseEntryDocs(await entries.find({}).sort({ updatedAt: -1, id: 1 }).toArray());
    },

    postCommunity: (raw: unknown, now?: Date) => postCommunityEntry(db, raw, now),
    createCurated: (raw: unknown, now?: Date) => createCuratedEntry(db, raw, now),
    update: (id: string, raw: unknown, now?: Date) => updateEntry(db, id, raw, now),
  };
}

export type EntryStore = ReturnType<typeof createEntryStore>;

export async function getEntryStore(): Promise<EntryStore> {
  return createEntryStore(await getDb());
}
