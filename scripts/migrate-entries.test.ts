import { describe, expect, it } from 'vitest';
import { superstitions } from '../src/data/superstitions';
import { createInMemoryTestDb } from '../src/test/inMemoryMongo';
import { migrateEntries } from './migrate-entries';
import { ensureIndexes } from './ensure-indexes';
import { mapSuperstitionToEntry } from '../src/lib/migration/mapSuperstitionToEntry';

describe('migrate-entries integration', () => {
  it('maps legacy superstition fields to entry shape', () => {
    const source = superstitions[0];
    const { entry } = mapSuperstitionToEntry(source);

    expect(entry.id).toBe(source.id);
    expect(entry.theDefault).toBe(source.whatPeopleBelieve);
    expect(entry.whyItStarted).toBe(source.historicalOrigin);
    expect(entry.whatsChangedSince).toBe(source.modernTwist);
    expect(entry.whyItStuck).toBe(source.theRealReason);
    expect(entry.origin).toBe('curated');
    expect(entry.status).toBe('live');
    expect(entry.version).toBe(1);
    expect(entry.legacy?.verdict).toBe(source.verdict);
    expect(entry.legacy?.theRealReason).toBe(source.theRealReason);
    expect(entry.categorySlugs.length).toBeGreaterThan(0);
  });

  it('migrates 42+ entries, writes versions, and is idempotent', async () => {
    const { db, cleanup } = await createInMemoryTestDb();

    const first = await migrateEntries(db, { dryRun: false });
    expect(first.mergedCount).toBeGreaterThanOrEqual(42);
    expect(first.upserted).toBeGreaterThanOrEqual(42);
    expect(first.versionsWritten).toBeGreaterThanOrEqual(42);

    const entriesCount = await db.collection('entries').countDocuments();
    const versionsCount = await db.collection('entryVersions').countDocuments();
    expect(entriesCount).toBeGreaterThanOrEqual(42);
    expect(versionsCount).toBeGreaterThanOrEqual(42);

    const sample = await db.collection('entries').findOne({ id: superstitions[0].id });
    expect(sample?.theDefault).toBe(superstitions[0].whatPeopleBelieve);
    expect(sample?.legacy?.legacyCategory).toBe(superstitions[0].category);

    const second = await migrateEntries(db, { dryRun: false });
    expect(await db.collection('entries').countDocuments()).toBe(entriesCount);
    expect(await db.collection('entryVersions').countDocuments()).toBe(versionsCount);
    expect(second.mergedCount).toBe(first.mergedCount);

    await cleanup();
  });

  it('supports dry-run without writes', async () => {
    const { db, cleanup } = await createInMemoryTestDb();

    const report = await migrateEntries(db, { dryRun: true });
    expect(report.dryRun).toBe(true);
    expect(report.mergedCount).toBeGreaterThanOrEqual(42);
    expect(await db.collection('entries').countDocuments()).toBe(0);

    await cleanup();
  });

  it('merges extra docs from legacy superstitions collection', async () => {
    const { db, cleanup } = await createInMemoryTestDb();

    await db.collection('superstitions').insertOne({
      id: 'db-only-entry',
      title: 'DB Only Entry',
      country: 'Japan',
      countryFlag: '🇯🇵',
      region: 'japan',
      category: 'travelAndJourney',
      whatPeopleBelieve: 'Belief',
      historicalOrigin: 'Origin',
      theRealReason: 'Reason',
      modernTwist: 'Twist',
      verdict: 'busted',
    });

    const report = await migrateEntries(db, { dryRun: false });
    expect(report.mergedCount).toBeGreaterThanOrEqual(43);
    expect(await db.collection('entries').findOne({ id: 'db-only-entry' })).toBeTruthy();

    await cleanup();
  });
});

describe('ensure-indexes', () => {
  it('runs twice without error (idempotent)', async () => {
    const { db, cleanup } = await createInMemoryTestDb();

    await expect(ensureIndexes(db)).resolves.toBeUndefined();
    await expect(ensureIndexes(db)).resolves.toBeUndefined();

    await cleanup();
  });
});
