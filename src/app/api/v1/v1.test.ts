import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { createChainStore } from '@/lib/chain/store';
import { applyStatusEvent } from '@/lib/moderation/transitions';
import { CURATED_ENTRY, postTestEntry } from '@/test/fixtures';
import { startTestMongo, type TestMongo } from '@/test/mongoServer';
import { GET as getCategories } from './categories/route';
import { GET as getChain } from './chain/route';
import { GET as getEntry } from './entries/[id]/route';
import { GET as listEntries, OPTIONS } from './entries/route';

let mongo: TestMongo;
let communityId: string;
let hiddenId: string;
const posterVisitorId = '7a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d';
const answererVisitorId = '8b2c3d4e-5f6a-4b7c-9d8e-0f1a2b3c4d5e';

async function json(response: Response) {
  return { status: response.status, headers: response.headers, body: await response.json() };
}

function get(path: string) {
  return new NextRequest(`http://localhost${path}`);
}

beforeAll(async () => {
  mongo = await startTestMongo({ migrate: true });
  process.env.MONGODB_URI = mongo.uri;

  communityId = await postTestEntry(mongo.db, { visitorId: posterVisitorId, postedBy: 'Asha' });
  hiddenId = await postTestEntry(mongo.db);

  const chain = createChainStore(mongo.db);
  await chain.answer({ visitorId: answererVisitorId, entryId: CURATED_ENTRY, passedDown: true, kept: false, region: 'india', generationBand: 'genZ' });
  await chain.answer({ visitorId: crypto.randomUUID(), entryId: CURATED_ENTRY, passedDown: true, kept: true });
  await chain.answer({ visitorId: crypto.randomUUID(), entryId: hiddenId, passedDown: false, kept: false, region: 'india' });
  await applyStatusEvent(mongo.db, { targetType: 'entry', targetId: hiddenId }, 'hide', 'admin');
});

afterAll(async () => {
  await mongo.stop();
});

describe('GET /api/v1/entries', () => {
  it('filters by region and pages through every live entry once', async () => {
    const liveIndia = await mongo.db.collection('entries').countDocuments({ region: 'india', status: 'live' });
    const first = await json(await listEntries(get('/api/v1/entries?region=india&limit=5')));

    expect(first.status).toBe(200);
    expect(first.body.data).toHaveLength(5);
    expect(first.body.data.every((entry: { region: string }) => entry.region === 'india')).toBe(true);
    expect(first.body.pagination).toEqual({ page: 1, limit: 5, total: liveIndia, totalPages: Math.ceil(liveIndia / 5) });

    const seen: string[] = [];
    for (let page = 1; page <= first.body.pagination.totalPages; page += 1) {
      const result = await json(await listEntries(get(`/api/v1/entries?region=india&limit=5&page=${page}`)));
      seen.push(...result.body.data.map((entry: { id: string }) => entry.id));
    }
    expect(new Set(seen).size).toBe(liveIndia);
    expect(seen).not.toContain(hiddenId);
  });

  it('filters by origin and category', async () => {
    const community = await json(await listEntries(get('/api/v1/entries?origin=community')));
    expect(community.body.data.map((entry: { id: string }) => entry.id)).toEqual([communityId]);

    const food = await json(await listEntries(get('/api/v1/entries?category=food&limit=100')));
    expect(food.body.data.length).toBeGreaterThan(0);
    expect(food.body.data.every((entry: { categorySlugs: string[] }) => entry.categorySlugs.includes('food'))).toBe(true);
  });

  it('rejects filters and page sizes it does not know', async () => {
    expect((await listEntries(get('/api/v1/entries?region=atlantis'))).status).toBe(400);
    expect((await listEntries(get('/api/v1/entries?origin=admin'))).status).toBe(400);
    expect((await listEntries(get('/api/v1/entries?limit=500'))).status).toBe(400);
    expect((await listEntries(get('/api/v1/entries?page=0'))).status).toBe(400);
  });

  it('never returns visitor ids, flags, moderation status or legacy data', async () => {
    const list = await listEntries(get('/api/v1/entries?limit=100'));
    const text = await list.text();
    for (const leak of [posterVisitorId, 'postedByVisitorId', 'flagCount', '"status"', 'legacy', 'verdict', '"_id"']) {
      expect(text).not.toContain(leak);
    }
  });

  it('allows cross-origin reads and sets a cache lifetime', async () => {
    const response = await listEntries(get('/api/v1/entries'));
    expect(response.headers.get('access-control-allow-origin')).toBe('*');
    expect(response.headers.get('cache-control')).toContain('s-maxage=300');

    const preflight = OPTIONS();
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get('access-control-allow-methods')).toBe('GET, OPTIONS');
  });
});

describe('GET /api/v1/entries/:id', () => {
  it('returns one live entry with its Broken Chain tally and no private fields', async () => {
    const result = await json(await getEntry(get(`/api/v1/entries/${communityId}`), { params: Promise.resolve({ id: communityId }) }));
    expect(result.status).toBe(200);
    expect(result.body.data).toMatchObject({ id: communityId, origin: 'community', postedBy: 'Asha', url: `http://localhost/superstition/${communityId}` });
    expect(result.body.data.chain).toEqual({ keptIt: 0, droppedIt: 0, pickedItUp: 0, neverHadIt: 0 });
    expect(JSON.stringify(result.body)).not.toContain(posterVisitorId);

    const curated = await json(await getEntry(get(`/api/v1/entries/${CURATED_ENTRY}`), { params: Promise.resolve({ id: CURATED_ENTRY }) }));
    expect(curated.body.data.chain).toEqual({ keptIt: 1, droppedIt: 1, pickedItUp: 0, neverHadIt: 0 });
  });

  it('answers 404 for an entry that is not live', async () => {
    const result = await getEntry(get(`/api/v1/entries/${hiddenId}`), { params: Promise.resolve({ id: hiddenId }) });
    expect(result.status).toBe(404);
    expect(result.headers.get('access-control-allow-origin')).toBe('*');
  });
});

describe('GET /api/v1/categories and /api/v1/chain', () => {
  it('lists categories with live entry counts and no database ids', async () => {
    const result = await json(await getCategories());
    const food = result.body.data.find((category: { slug: string }) => category.slug === 'food');
    expect(food).toMatchObject({ slug: 'food', label: expect.any(String) });
    expect(food.entryCount).toBeGreaterThan(0);
    expect(JSON.stringify(result.body)).not.toContain('_id');
  });

  it('tallies Broken Chain answers on live entries only, overall and by region and generation', async () => {
    const result = await json(await getChain());
    expect(result.body.data).toEqual({
      answers: 2,
      tally: { keptIt: 1, droppedIt: 1, pickedItUp: 0, neverHadIt: 0 },
      byRegion: {
        india: { keptIt: 0, droppedIt: 1, pickedItUp: 0, neverHadIt: 0 },
        unspecified: { keptIt: 1, droppedIt: 0, pickedItUp: 0, neverHadIt: 0 },
      },
      byGeneration: {
        genZ: { keptIt: 0, droppedIt: 1, pickedItUp: 0, neverHadIt: 0 },
        unspecified: { keptIt: 1, droppedIt: 0, pickedItUp: 0, neverHadIt: 0 },
      },
    });
    expect(JSON.stringify(result.body)).not.toContain(answererVisitorId);
  });
});
