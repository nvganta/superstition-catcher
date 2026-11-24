import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { superstitions } from '@/data/superstitions';
import { startTestMongo, type TestMongo } from '@/test/mongoServer';
import { ensureIndexes } from '../../../scripts/ensure-indexes';
import { createEntryStore, type EntryStore } from './store';

let mongo: TestMongo;
let store: EntryStore;

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

async function setStatus(id: string, status: string) {
  await mongo.db.collection('entries').updateOne({ id }, { $set: { status } });
}

describe('entry store reads', () => {
  it('serves every migrated seed entry as a typed live entry', async () => {
    const live = await store.listLive();

    expect(live.map((entry) => entry.id).sort()).toEqual(superstitions.map((s) => s.id).sort());

    const lemons = live.find((entry) => entry.id === 'lemons-chillies-door');
    const seed = superstitions.find((s) => s.id === 'lemons-chillies-door')!;
    expect(lemons?.theDefault).toBe(seed.whatPeopleBelieve);
    expect(lemons?.whyItStarted).toBe(seed.historicalOrigin);
    expect(lemons?.categorySlugs).toEqual(['home']);
    expect(lemons?.createdAt).toBeInstanceOf(Date);
  });

  it('hides entries that are not live from every public read', async () => {
    await setStatus('lemons-chillies-door', 'hidden');

    expect(await store.getLive('lemons-chillies-door')).toBeNull();
    expect((await store.listLive()).some((entry) => entry.id === 'lemons-chillies-door')).toBe(false);
    expect((await store.search('pungent')).map((entry) => entry.id)).not.toContain('lemons-chillies-door');
    expect((await store.listAllForAdmin()).some((entry) => entry.id === 'lemons-chillies-door')).toBe(true);
  });

  it('returns null for an unknown id', async () => {
    expect(await store.getLive('no-such-entry')).toBeNull();
  });

  it('filters by region and by category slug', async () => {
    const japan = await store.listLive({ region: 'japan' });
    expect(japan.length).toBe(superstitions.filter((s) => s.region === 'japan').length);
    expect(japan.every((entry) => entry.region === 'japan')).toBe(true);

    const food = await store.listLive({ categorySlug: 'food' });
    expect(food.length).toBe(superstitions.filter((s) => s.category === 'foodAndEating').length);
  });

  it('finds an entry by a word that only appears in its whyItStarted text', async () => {
    const results = await store.search('pungent');
    expect(results.map((entry) => entry.id)).toEqual(['lemons-chillies-door']);
  });

  it('matches partial words at the start of a title or country while typing', async () => {
    const results = await store.search('Japa', 50);
    expect(results.length).toBe(superstitions.filter((s) => s.country.startsWith('Japan')).length);
    expect(results.every((entry) => entry.country.startsWith('Japan'))).toBe(true);
  });

  it('treats regex characters in a query as plain text', async () => {
    await expect(store.search('(.*')).resolves.toEqual([]);
  });

  it('ignores queries shorter than two characters', async () => {
    expect(await store.search('a')).toEqual([]);
  });

  it('picks a stable live entry of the day that rotates daily', async () => {
    const monday = new Date('2026-11-23T08:00:00Z');
    const mondayLater = new Date('2026-11-23T22:00:00Z');
    const tuesday = new Date('2026-11-24T08:00:00Z');

    const first = await store.entryOfTheDay(monday);
    expect(first?.status).toBe('live');
    expect((await store.entryOfTheDay(mondayLater))?.id).toBe(first?.id);
    expect((await store.entryOfTheDay(tuesday))?.id).not.toBe(first?.id);
  });

  it('returns no entry of the day when nothing is live', async () => {
    await mongo.db.collection('entries').updateMany({}, { $set: { status: 'hidden' } });
    expect(await store.entryOfTheDay()).toBeNull();
  });

  it('relates entries that share a category or region, never the entry itself', async () => {
    const lemons = (await store.getLive('lemons-chillies-door'))!;
    const related = await store.listRelated(lemons);

    expect(related.length).toBe(3);
    for (const entry of related) {
      expect(entry.id).not.toBe(lemons.id);
      expect(entry.region === lemons.region || entry.categorySlugs.includes('home')).toBe(true);
    }
  });

  it('counts live entries per category and lists categories in sort order', async () => {
    const categories = await store.listCategories();
    expect(categories[0]?.slug).toBe('job');
    expect(categories.map((category) => category.sortOrder)).toEqual(
      [...categories.map((category) => category.sortOrder)].sort((a, b) => a - b)
    );

    const counts = await store.liveCountsByCategory();
    expect(counts.numbers).toBe(superstitions.filter((s) => s.category === 'numbers').length);
    expect(counts.job).toBeUndefined();
  });

  it('skips a malformed document instead of failing the whole list', async () => {
    await mongo.db.collection('entries').insertOne({ id: 'broken', status: 'live', title: null });
    const live = await store.listLive();
    expect(live.length).toBe(superstitions.length);
  });

  it('can ensure indexes repeatedly against a real server', async () => {
    await expect(ensureIndexes(mongo.db)).resolves.toBeUndefined();
    await expect(ensureIndexes(mongo.db)).resolves.toBeUndefined();
  });
});
