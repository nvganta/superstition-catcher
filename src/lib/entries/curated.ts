import type { Db } from 'mongodb';
import { entrySchema, type Entry } from '@/lib/schema/entry';
import {
  isDuplicateKeyError,
  parseEntryDocs,
  setAndUnset,
  slugify,
  unknownCategorySlugs,
  writeVersionSnapshot,
} from './documents';
import { adminEntryCreateSchema, adminEntryUpdateSchema } from './input';
import { invalid, issuesFrom, type EntryWriteResult } from './results';

/**
 * Admin edits touch content only. Status and flagCount belong to moderation, so an edit saved
 * while a flag lands cannot undo it.
 */
const EDITABLE_FIELDS = (Object.keys(adminEntryUpdateSchema.shape) as (keyof Entry)[]).filter(
  (field) => field !== 'version'
);

export async function createCuratedEntry(
  db: Db,
  raw: unknown,
  now = new Date()
): Promise<EntryWriteResult> {
  const parsed = adminEntryCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return { kind: 'invalid', issues: issuesFrom(parsed.error) };
  }
  const { id, ...fields } = parsed.data;

  const unknown = await unknownCategorySlugs(db, fields.categorySlugs);
  if (unknown.length > 0) {
    return invalid('categorySlugs', `Unknown category: ${unknown.join(', ')}`);
  }

  const candidate = entrySchema.safeParse({
    ...fields,
    id: id ?? slugify(fields.title),
    origin: 'curated',
    status: 'live',
    flagCount: 0,
    version: 1,
    createdAt: now,
    updatedAt: now,
  });
  if (!candidate.success) {
    return { kind: 'invalid', issues: issuesFrom(candidate.error) };
  }
  const entry = candidate.data;

  try {
    await db.collection('entries').insertOne({ ...entry });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return { kind: 'duplicateId', id: entry.id };
    }
    throw error;
  }
  await writeVersionSnapshot(db, entry, now);

  return { kind: 'created', entry };
}

export async function updateEntry(
  db: Db,
  id: string,
  raw: unknown,
  now = new Date()
): Promise<EntryWriteResult> {
  const parsed = adminEntryUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return { kind: 'invalid', issues: issuesFrom(parsed.error) };
  }
  const { version: expectedVersion, ...fields } = parsed.data;

  const entries = db.collection('entries');
  const doc = await entries.findOne({ id });
  const [existing] = doc ? parseEntryDocs([doc]) : [];
  if (!existing) {
    return { kind: 'notFound' };
  }
  if (existing.version !== expectedVersion) {
    return { kind: 'conflict', currentVersion: existing.version };
  }

  const unknown = await unknownCategorySlugs(db, fields.categorySlugs);
  if (unknown.length > 0) {
    return invalid('categorySlugs', `Unknown category: ${unknown.join(', ')}`);
  }

  const edited = Object.fromEntries(
    EDITABLE_FIELDS.map((field) => [field, fields[field as keyof typeof fields]])
  ) as Partial<Entry>;
  const candidate = entrySchema.safeParse({
    ...existing,
    ...edited,
    version: existing.version + 1,
    updatedAt: now,
  });
  if (!candidate.success) {
    return { kind: 'invalid', issues: issuesFrom(candidate.error) };
  }
  const entry = candidate.data;

  const saved = await entries.findOneAndUpdate(
    { id, version: existing.version },
    setAndUnset({ ...edited, version: entry.version, updatedAt: now }),
    { returnDocument: 'after' }
  );
  const [current] = saved ? parseEntryDocs([saved]) : [];
  if (!current) {
    const latest = await entries.findOne({ id }, { projection: { version: 1 } });
    return { kind: 'conflict', currentVersion: (latest?.version as number | undefined) ?? existing.version };
  }
  await writeVersionSnapshot(db, current, now);

  return { kind: 'saved', entry: current };
}
