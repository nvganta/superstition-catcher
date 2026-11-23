import type { Db } from 'mongodb';
import { checkContent, type GuardrailMatch } from '@/lib/guardrails/checkContent';
import { checkRateLimit, recordRateLimitEvent } from '@/lib/guardrails/rateLimit';
import { entrySchema, type Entry } from '@/lib/schema/entry';
import {
  parseEntryDocs,
  slugify,
  unknownCategorySlugs,
  writeVersionSnapshot,
} from './documents';
import { communityEntryInputSchema } from './input';
import { invalid, issuesFrom, type EntryWriteResult, type FieldIssue } from './results';

const DEFAULT_FLAG = '🌐';
const PREVIOUS_POSTS_COMPARED = 5;

type GuardedFields = Pick<
  Entry,
  'title' | 'country' | 'postedBy' | 'theDefault' | 'whyItStarted' | 'whyItStuck' | 'whatsChangedSince' | 'freshLook'
>;

function guardedFields(entry: GuardedFields): Record<string, string | undefined> {
  return {
    title: entry.title,
    country: entry.country,
    postedBy: entry.postedBy,
    theDefault: entry.theDefault,
    whyItStarted: entry.whyItStarted,
    whyItStuck: entry.whyItStuck,
    whatsChangedSince: entry.whatsChangedSince,
    freshLook: entry.freshLook,
  };
}

function postBody(entry: GuardedFields): string {
  return Object.values(guardedFields(entry)).filter(Boolean).join('\n');
}

function guardrailIssues(matches: GuardrailMatch[]): FieldIssue[] {
  const seen = new Set<string>();
  return matches.flatMap((match) => {
    const issue = { field: match.rule === 'slur' ? undefined : match.field, message: match.message };
    const key = `${issue.field}|${issue.message}`;
    if (seen.has(key)) {
      return [];
    }
    seen.add(key);
    return [issue];
  });
}

export async function postCommunityEntry(
  db: Db,
  raw: unknown,
  now = new Date()
): Promise<EntryWriteResult> {
  const parsed = communityEntryInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { kind: 'invalid', issues: issuesFrom(parsed.error) };
  }
  const input = parsed.data;

  const unknown = await unknownCategorySlugs(db, input.categorySlugs);
  if (unknown.length > 0) {
    return invalid('categorySlugs', `Unknown category: ${unknown.join(', ')}`);
  }

  const limit = await checkRateLimit(db, input.visitorId, 'newEntry', now);
  if (!limit.allowed) {
    return {
      kind: 'rateLimited',
      retryAfter: limit.retryAfter,
      message: limit.reason ?? 'Please slow down before posting again.',
    };
  }

  const entries = db.collection('entries');
  const previous = parseEntryDocs(
    await entries
      .find({ postedByVisitorId: input.visitorId })
      .sort({ createdAt: -1 })
      .limit(PREVIOUS_POSTS_COMPARED)
      .toArray()
  );

  const check = checkContent({
    contentType: 'entry',
    fields: guardedFields(input),
    sourceUrls: input.sources.flatMap((source) => (source.url ? [source.url] : [])),
    previousPosts: previous.map(postBody),
  });
  if (check.result !== 'passed') {
    return { kind: 'rejected', guardrail: check.result, issues: guardrailIssues(check.matches) };
  }

  const entry = entrySchema.parse({
    id: `${slugify(input.title)}-${crypto.randomUUID().slice(0, 6)}`,
    title: input.title,
    country: input.country,
    countryFlag: input.countryFlag ?? DEFAULT_FLAG,
    region: input.region,
    categorySlugs: input.categorySlugs,
    tags: [],
    theDefault: input.theDefault,
    whyItStarted: input.whyItStarted,
    whyItStuck: input.whyItStuck,
    whatsChangedSince: input.whatsChangedSince,
    freshLook: input.freshLook,
    sources: input.sources,
    origin: 'community',
    status: 'live',
    postedByVisitorId: input.visitorId,
    postedBy: input.postedBy,
    flagCount: 0,
    version: 1,
    createdAt: now,
    updatedAt: now,
  });

  await entries.insertOne({ ...entry });
  await writeVersionSnapshot(db, entry, now);
  await recordRateLimitEvent(db, input.visitorId, 'newEntry', now);
  await db
    .collection('visitors')
    .updateOne(
      { id: input.visitorId },
      { $setOnInsert: { id: input.visitorId, createdAt: now }, $set: { lastSeenAt: now } },
      { upsert: true }
    );

  return { kind: 'created', entry };
}
