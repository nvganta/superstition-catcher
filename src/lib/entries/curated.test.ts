import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { startTestMongo, type TestMongo } from '@/test/mongoServer';
import { migrateEntries } from '../../../scripts/migrate-entries';
import type { Entry } from '@/lib/schema/entry';
import { createEntryStore, type EntryStore } from './store';

let mongo: TestMongo;
let store: EntryStore;

const now = new Date('2026-11-23T10:00:00Z');

function curated(overrides: Record<string, unknown> = {}) {
  return {
    title: 'Breaking a coconut before a new venture',
    country: 'India',
    countryFlag: '🇮🇳',
    region: 'india',
    categorySlugs: ['job', 'religionRituals'],
    tags: ['coconut'],
    theDefault: 'Smash a coconut before starting a business, a vehicle, or a film shoot.',
    whyItStarted: 'Coconut offerings replaced older sacrificial rites in temple practice.',
    whyItStuck: 'It is public, cheap, and marks a clear beginning.',
    whatsChangedSince: 'Start-ups now break coconuts at office launches.',
    confidence: 'likely',
    sources: [{ title: 'Temple Rituals of South India', kind: 'book' }],
    ...overrides,
  };
}

function editable(entry: Entry, overrides: Record<string, unknown> = {}) {
  return {
    title: entry.title,
    country: entry.country,
    countryFlag: entry.countryFlag,
    region: entry.region,
    categorySlugs: entry.categorySlugs,
    tags: entry.tags,
    theDefault: entry.theDefault,
    whyItStarted: entry.whyItStarted,
    whyItStuck: entry.whyItStuck,
    whatsChangedSince: entry.whatsChangedSince,
    freshLook: entry.freshLook,
    sources: entry.sources,
    confidence: entry.confidence,
    uncertaintyNote: entry.uncertaintyNote,
    postedBy: entry.postedBy,
    status: entry.status,
    version: entry.version,
    ...overrides,
  };
}

async function versionsOf(id: string) {
  return mongo.db
    .collection('entryVersions')
    .find({ entryId: id })
    .sort({ version: 1 })
    .toArray();
}

beforeAll(async () => {
  mongo = await startTestMongo({ migrate: true });
  store = createEntryStore(mongo.db);
});

beforeEach(async () => {
  await mongo.reset();
});

afterAll(async () => {
  await mongo.stop();
});

describe('curated entry admin flow', () => {
  it('creates a live curated entry at version 1 with a snapshot', async () => {
    const result = await store.createCurated(curated(), now);

    expect(result.kind).toBe('created');
    if (result.kind !== 'created') return;
    expect(result.entry).toMatchObject({
      id: 'breaking-a-coconut-before-a-new-venture',
      origin: 'curated',
      status: 'live',
      version: 1,
      confidence: 'likely',
    });
    expect(await store.getLive('breaking-a-coconut-before-a-new-venture')).not.toBeNull();
    expect((await versionsOf(result.entry.id)).map((doc) => doc.version)).toEqual([1]);
  });

  it('requires a confidence level', async () => {
    const result = await store.createCurated(curated({ confidence: '' }), now);

    expect(result.kind).toBe('invalid');
    if (result.kind !== 'invalid') return;
    expect(result.issues).toContainEqual({
      field: 'confidence',
      message: 'Curated entries require a confidence level',
    });
    expect(await store.getLive('breaking-a-coconut-before-a-new-venture')).toBeNull();
  });

  it('requires at least one source for a new curated entry', async () => {
    const result = await store.createCurated(curated({ sources: [] }), now);

    expect(result.kind).toBe('invalid');
    if (result.kind !== 'invalid') return;
    expect(result.issues.map((issue) => issue.field)).toContain('sources');
  });

  it('refuses to overwrite an existing id', async () => {
    const result = await store.createCurated(curated({ id: 'lemons-chillies-door' }), now);

    expect(result).toEqual({ kind: 'duplicateId', id: 'lemons-chillies-door' });
    expect((await store.getLive('lemons-chillies-door'))?.title).toBe('Hanging Lemons & Chillies at Doorways');
  });

  it('increments the version on edit and keeps every prior snapshot', async () => {
    const original = (await store.getLive('lemons-chillies-door'))!;

    const result = await store.update(
      original.id,
      editable(original, {
        freshLook: 'Ask what you are really protecting the doorway from.',
        confidence: 'established',
      }),
      now
    );

    expect(result.kind).toBe('saved');
    const live = await store.getLive(original.id);
    expect(live?.version).toBe(2);
    expect(live?.freshLook).toBe('Ask what you are really protecting the doorway from.');
    expect(live?.legacy?.verdict).toBe(original.legacy?.verdict);
    expect(live?.createdAt).toEqual(original.createdAt);

    const versions = await versionsOf(original.id);
    expect(versions.map((doc) => doc.version)).toEqual([1, 2]);
    expect(versions[0]?.snapshot.freshLook).toBeUndefined();
    expect(versions[1]?.snapshot.freshLook).toBe('Ask what you are really protecting the doorway from.');
  });

  it('rejects an edit made against a stale version', async () => {
    const original = (await store.getLive('lemons-chillies-door'))!;
    expect((await store.update(original.id, editable(original), now)).kind).toBe('saved');

    const stale = await store.update(original.id, editable(original, { title: 'Stale title' }), now);

    expect(stale).toEqual({ kind: 'conflict', currentVersion: 2 });
    expect((await store.getLive(original.id))?.title).toBe(original.title);
    expect((await versionsOf(original.id)).length).toBe(2);
  });

  it('still requires a source when a curated entry has no legacy data', async () => {
    const created = await store.createCurated(curated(), now);
    if (created.kind !== 'created') throw new Error('setup failed');

    const result = await store.update(created.entry.id, editable(created.entry, { sources: [] }), now);

    expect(result.kind).toBe('invalid');
    expect((await store.getLive(created.entry.id))?.version).toBe(1);
  });

  it('takes an entry off the public site when its status is set to hidden', async () => {
    const original = (await store.getLive('lemons-chillies-door'))!;
    await store.update(original.id, editable(original, { status: 'hidden' }), now);

    expect(await store.getLive(original.id)).toBeNull();
  });

  it('returns notFound for an unknown entry', async () => {
    const original = (await store.getLive('lemons-chillies-door'))!;
    expect(await store.update('missing-entry', editable(original), now)).toEqual({ kind: 'notFound' });
  });

  it('does not let a migration rerun revert an admin edit', async () => {
    const original = (await store.getLive('lemons-chillies-door'))!;
    await store.update(original.id, editable(original, { title: 'Edited title' }), now);

    await migrateEntries(mongo.db);

    const live = await store.getLive(original.id);
    expect(live?.title).toBe('Edited title');
    expect(live?.version).toBe(2);
  });
});
