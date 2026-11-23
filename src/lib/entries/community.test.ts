import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { DAILY_LIMITS, MIN_POST_INTERVAL_SECONDS } from '@/lib/guardrails/rateLimit';
import { startTestMongo, type TestMongo } from '@/test/mongoServer';
import { createEntryStore, type EntryStore } from './store';

let mongo: TestMongo;
let store: EntryStore;

const visitorId = '6f1c2d3e-4b5a-4c6d-8e7f-90a1b2c3d4e5';
const start = new Date('2026-11-23T09:00:00Z');

function post(overrides: Record<string, unknown> = {}) {
  return {
    visitorId,
    title: 'Never sweep the house after sunset',
    country: 'India',
    countryFlag: '🇮🇳',
    region: 'india',
    categorySlugs: ['home'],
    theDefault: 'Sweeping after dark sweeps the household luck out of the door.',
    whyItStarted: 'Homes were lit by oil lamps, so small valuables were easy to lose in the dark.',
    whyItStuck: 'Elders repeated it as a rule about respect for the evening lamp.',
    whatsChangedSince: 'With electric light most families sweep whenever they like.',
    postedBy: 'Asha',
    ...overrides,
  };
}

function later(seconds: number) {
  return new Date(start.getTime() + seconds * 1000);
}

beforeAll(async () => {
  mongo = await startTestMongo();
  store = createEntryStore(mongo.db);
});

beforeEach(async () => {
  await mongo.reset();
});

afterAll(async () => {
  await mongo.stop();
});

describe('community entry posting', () => {
  it('publishes an accepted post instantly as a live community entry', async () => {
    const result = await store.postCommunity(post(), start);

    expect(result.kind).toBe('created');
    if (result.kind !== 'created') return;
    expect(result.entry.id).toMatch(/^never-sweep-the-house-after-sunset-[0-9a-f]{6}$/);

    const live = await store.getLive(result.entry.id);
    expect(live).toMatchObject({
      origin: 'community',
      status: 'live',
      version: 1,
      postedBy: 'Asha',
      theDefault: 'Sweeping after dark sweeps the household luck out of the door.',
    });
    const admin = (await store.listAllForAdmin()).find((entry) => entry.id === result.entry.id);
    expect(admin?.postedByVisitorId).toBe(visitorId);
    expect((await store.search('oil lamps')).map((entry) => entry.id)).toContain(result.entry.id);

    const snapshot = await mongo.db.collection('entryVersions').findOne({ entryId: result.entry.id });
    expect(snapshot?.version).toBe(1);
    expect(snapshot?.snapshot.origin).toBe('community');
    expect(await mongo.db.collection('visitors').countDocuments({ id: visitorId })).toBe(1);
  });

  it("never exposes the poster's visitor id through a public read", async () => {
    const result = await store.postCommunity(post(), start);
    if (result.kind !== 'created') throw new Error('setup failed');
    const id = result.entry.id;

    const publicReads = [
      await store.getLive(id),
      ...(await store.listLive()),
      ...(await store.search('oil lamps')),
      ...(await store.listRelated((await store.getLive(id))!)),
      await store.entryOfTheDay(),
    ];
    expect(publicReads.some((entry) => entry?.id === id)).toBe(true);
    for (const entry of publicReads) {
      expect(entry).not.toHaveProperty('postedByVisitorId');
    }
  });

  it('reports missing required fields without storing anything', async () => {
    const result = await store.postCommunity(post({ theDefault: '   ' }), start);

    expect(result.kind).toBe('invalid');
    if (result.kind !== 'invalid') return;
    expect(result.issues.map((issue) => issue.field)).toContain('theDefault');
    expect(await mongo.db.collection('entries').countDocuments()).toBe(0);
  });

  it('rejects categories that are not in the taxonomy', async () => {
    const result = await store.postCommunity(post({ categorySlugs: ['astrology'] }), start);

    expect(result).toEqual({
      kind: 'invalid',
      issues: [{ field: 'categorySlugs', message: 'Unknown category: astrology' }],
    });
  });

  it('holds posts containing contact details and names the field', async () => {
    const result = await store.postCommunity(
      post({ whyItStuck: 'Ask my aunt, write to aunt.meena@example.com' }),
      start
    );

    expect(result.kind).toBe('rejected');
    if (result.kind !== 'rejected') return;
    expect(result.guardrail).toBe('heldForEdit');
    expect(result.issues).toContainEqual({
      field: 'whyItStuck',
      message: 'Please remove email addresses before posting.',
    });
    expect(await mongo.db.collection('entries').countDocuments()).toBe(0);
  });

  it('blocks slurs without echoing the matched term back', async () => {
    const result = await store.postCommunity(post({ theDefault: 'They called the neighbours n1gg3r' }), start);

    expect(result.kind).toBe('rejected');
    if (result.kind !== 'rejected') return;
    expect(result.guardrail).toBe('blocked');
    expect(JSON.stringify(result.issues)).not.toMatch(/n1gg3r|nigger/i);
    expect(await mongo.db.collection('entries').countDocuments()).toBe(0);
  });

  it('checks source titles and the flag, which are shown publicly', async () => {
    const pii = await store.postCommunity(
      post({ sources: [{ title: 'Uncle Ravi, 555-123-4567', kind: 'oral' }] }),
      start
    );
    expect(pii).toMatchObject({
      kind: 'rejected',
      guardrail: 'heldForEdit',
      issues: [{ field: 'sourceTitles', message: 'Please remove phone numbers before posting.' }],
    });

    const slur = await store.postCommunity(
      post({ sources: [{ title: 'n1gg3r jokes weekly', kind: 'web' }] }),
      start
    );
    expect(slur).toMatchObject({ kind: 'rejected', guardrail: 'blocked' });
    expect(await mongo.db.collection('entries').countDocuments()).toBe(0);
  });

  it('accepts only http and https source links', async () => {
    const result = await store.postCommunity(
      post({ sources: [{ title: 'A page', url: 'javascript:alert(1)', kind: 'web' }] }),
      start
    );
    expect(result).toEqual({
      kind: 'invalid',
      issues: [{ field: 'sources.0.url', message: 'Source link must start with http:// or https://' }],
    });
  });

  it('enforces the minimum interval between posts from one visitor', async () => {
    expect((await store.postCommunity(post(), start)).kind).toBe('created');

    const tooSoon = await store.postCommunity(post({ title: 'A different tradition' }), later(5));
    expect(tooSoon.kind).toBe('rateLimited');
    if (tooSoon.kind !== 'rateLimited') return;
    expect(tooSoon.retryAfter).toBe(MIN_POST_INTERVAL_SECONDS - 5);
    expect(await mongo.db.collection('entries').countDocuments()).toBe(1);
  });

  it('caps a visitor at the daily new-entry limit', async () => {
    for (let i = 0; i < DAILY_LIMITS.newEntry; i += 1) {
      const result = await store.postCommunity(
        post({
          title: `Tradition number ${i}`,
          theDefault: `Belief ${i}: ${'abcdefghij'.repeat(i + 1)} is said to bring luck.`,
          whyItStarted: `Origin story ${i} with its own details and a distinct ${i * 7} reasons.`,
          whyItStuck: `It persisted for reason ${i}.`,
          whatsChangedSince: `Change ${i}.`,
        }),
        later(i * 60)
      );
      expect(result.kind).toBe('created');
    }

    const capped = await store.postCommunity(post({ title: 'One too many' }), later(3600));
    expect(capped.kind).toBe('rateLimited');
    expect(await mongo.db.collection('entries').countDocuments()).toBe(DAILY_LIMITS.newEntry);
  });

  it('blocks a near-duplicate of the visitor\'s previous post', async () => {
    expect((await store.postCommunity(post(), start)).kind).toBe('created');

    const repeat = await store.postCommunity(post({ title: 'Never sweep the house after sunset!' }), later(60));
    expect(repeat.kind).toBe('rejected');
    if (repeat.kind !== 'rejected') return;
    expect(repeat.guardrail).toBe('blocked');
  });
});
