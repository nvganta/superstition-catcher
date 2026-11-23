import { MongoClient, type Db, type Document } from 'mongodb';
import { z } from 'zod';
import { assertSafeMongoUri, DB_NAME, MONGO_CLIENT_OPTIONS } from '../src/lib/db/safeMongo';
import { legacyReactionTypeSchema, reactionSchema, type LegacyReactionType, type Reaction } from '../src/lib/schema/reaction';

/**
 * The old emoji reactions become ratings on the new 1 to 5 scale. A like is a solid yes, a
 * mind-blown is the strongest yes the old buttons could say, and a dislike is a low but not
 * bottom score, since the old buttons had no way to say "not worth a look at all".
 */
export const LEGACY_RATINGS: Record<LegacyReactionType, number> = {
  mind_blown: 5,
  like: 4,
  dislike: 2,
};

export const LEGACY_ARCHIVE = 'legacyReactions';

/** Pre-Wave-3 documents in `reactions`, as written by the deleted POST /api/reactions. */
const legacyReactionSchema = z.object({
  superstitionId: z.string().min(1).max(120),
  type: legacyReactionTypeSchema,
  visitorId: z.string().uuid(),
  createdAt: z.coerce.date().optional(),
});

const LEGACY_FILTER = { superstitionId: { $exists: true } };

export interface ReactionMigrationReport {
  dryRun: boolean;
  legacyFound: number;
  ratingsCreated: number;
  /** The visitor already rated the entry on the new scale, so that rating stands. */
  alreadyRated: number;
  /** The superstition id matches no entry. Archived, not converted. */
  orphaned: number;
  /** Missing or malformed fields. Archived, not converted. */
  invalid: number;
}

type Plan = { kind: 'rate'; reaction: Reaction } | { kind: 'orphaned' } | { kind: 'invalid' };

export function planLegacyReaction(doc: Document, entryIds: ReadonlySet<string>, now: Date): Plan {
  const parsed = legacyReactionSchema.safeParse(doc);
  if (!parsed.success) return { kind: 'invalid' };
  const { superstitionId, type, visitorId, createdAt } = parsed.data;
  if (!entryIds.has(superstitionId)) return { kind: 'orphaned' };
  return {
    kind: 'rate',
    reaction: reactionSchema.parse({
      entryId: superstitionId,
      visitorId,
      kind: 'rate',
      value: LEGACY_RATINGS[type],
      legacyType: type,
      createdAt: createdAt ?? now,
      updatedAt: createdAt ?? now,
    }),
  };
}

/**
 * Moves every legacy reaction out of `reactions`, newest first so the latest of any duplicates
 * wins: converts it to a rating, copies the original
 * into `legacyReactions`, then deletes it. Each step is keyed so a rerun after a crash at any
 * point repeats nothing and finishes the rest. It must run before ensure-indexes, whose unique
 * (entryId, visitorId, kind) index cannot be built while one visitor has two legacy documents.
 */
export async function migrateReactions(
  db: Db,
  { dryRun = false, now = new Date() }: { dryRun?: boolean; now?: Date } = {}
): Promise<ReactionMigrationReport> {
  const reactions = db.collection('reactions');
  const archive = db.collection(LEGACY_ARCHIVE);
  const entryIds = new Set(
    (await db.collection('entries').find({}, { projection: { id: 1 } }).toArray()).map((doc) => String(doc.id))
  );

  const report: ReactionMigrationReport = {
    dryRun,
    legacyFound: 0,
    ratingsCreated: 0,
    alreadyRated: 0,
    orphaned: 0,
    invalid: 0,
  };

  for await (const doc of reactions.find(LEGACY_FILTER).sort({ createdAt: -1 })) {
    report.legacyFound++;
    const plan = planLegacyReaction(doc, entryIds, now);

    if (plan.kind === 'rate') {
      const { entryId, visitorId, kind } = plan.reaction;
      const key = { entryId, visitorId, kind };
      if (dryRun) {
        if (await reactions.findOne(key)) report.alreadyRated++;
        else report.ratingsCreated++;
      } else {
        const written = await reactions.updateOne(key, { $setOnInsert: plan.reaction }, { upsert: true });
        if (written.upsertedCount > 0) report.ratingsCreated++;
        else report.alreadyRated++;
      }
    } else {
      report[plan.kind]++;
    }

    if (!dryRun) {
      await archive.updateOne({ _id: doc._id }, { $setOnInsert: { ...doc, archivedAt: now } }, { upsert: true });
      await reactions.deleteOne({ _id: doc._id });
    }
  }

  return report;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const uri = process.env.MONGODB_URI;
  assertSafeMongoUri(uri, 'migrate-reactions');

  const client = new MongoClient(uri, MONGO_CLIENT_OPTIONS);
  await client.connect();

  try {
    const report = await migrateReactions(client.db(DB_NAME), { dryRun });
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
