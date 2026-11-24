import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { startTestMongo, type TestMongo } from '@/test/mongoServer';
import { postTestEntry } from '@/test/fixtures';
import { flagTarget } from '@/lib/moderation/flags';
import { FLAG_THRESHOLD } from '@/lib/moderation/statusMachine';
import { applyStatusEvent } from '@/lib/moderation/transitions';
import { createChainStore, type ChainStore } from './store';

let mongo: TestMongo;
let chain: ChainStore;
let entryId: string;

const start = new Date('2026-11-23T09:00:00Z');

function later(seconds: number) {
  return new Date(start.getTime() + seconds * 1000);
}

async function publicView(visitorId: string | null = null) {
  const view = await chain.view(entryId, visitorId);
  if (!view) throw new Error('entry is not public');
  return view;
}

function answer(visitorId: string, overrides: Record<string, unknown> = {}, now = start) {
  return chain.answer({ visitorId, entryId, passedDown: true, kept: false, ...overrides }, now);
}

beforeAll(async () => {
  mongo = await startTestMongo();
  chain = createChainStore(mongo.db);
});

beforeEach(async () => {
  await mongo.reset();
  entryId = await postTestEntry(mongo.db);
});

afterAll(async () => {
  await mongo.stop();
});

describe('Broken Chain answers', () => {
  it('tallies answers and shows live stories', async () => {
    await answer(crypto.randomUUID(), { storyText: 'My grandmother swept only at dawn.', name: 'Asha', generationBand: 'millennial', region: 'india' });
    await answer(crypto.randomUUID(), { passedDown: true, kept: true });
    const result = await answer(crypto.randomUUID(), { passedDown: false, kept: false });

    expect(result.kind).toBe('saved');
    const view = await publicView();
    expect(view.tally).toEqual({ keptIt: 1, droppedIt: 1, pickedItUp: 0, neverHadIt: 1 });
    expect(view.stories).toMatchObject([
      { passedDown: true, kept: false, text: 'My grandmother swept only at dawn.', name: 'Asha', generationBand: 'millennial', region: 'india' },
    ]);
    expect(view.mine).toBeNull();
  });

  it('updates the same visitor’s answer instead of adding a second one', async () => {
    const visitorId = crypto.randomUUID();
    await answer(visitorId, { storyText: 'First telling.' });

    const second = await answer(visitorId, { kept: true, storyText: 'I took it back up.' }, later(60));

    expect(await mongo.db.collection('chainEntries').countDocuments({ entryId, visitorId })).toBe(1);
    if (second.kind !== 'saved') throw new Error(second.kind);
    expect(second.view.tally).toEqual({ keptIt: 1, droppedIt: 0, pickedItUp: 0, neverHadIt: 0 });
    expect(second.view.stories.map((story) => story.text)).toEqual(['I took it back up.']);
    expect(second.view.mine).toMatchObject({ kept: true, storyText: 'I took it back up.', status: 'live' });
  });

  it('keeps one answer per visitor when the same visitor posts many times at once', async () => {
    const visitorId = crypto.randomUUID();

    const results = await Promise.all(
      Array.from({ length: 8 }, (_, index) => answer(visitorId, { kept: index % 2 === 0 }))
    );

    expect(results.every((result) => result.kind === 'saved')).toBe(true);
    expect(await mongo.db.collection('chainEntries').countDocuments({ entryId, visitorId })).toBe(1);
    const { tally } = await publicView();
    expect(tally.keptIt + tally.droppedIt).toBe(1);
  });

  it('is backed by a unique index, so no write path can add a second answer', async () => {
    const visitorId = crypto.randomUUID();
    await answer(visitorId);
    const [existing] = await mongo.db.collection('chainEntries').find({}, { projection: { _id: 0 } }).toArray();

    await expect(
      mongo.db.collection('chainEntries').insertOne({ ...existing, id: crypto.randomUUID() })
    ).rejects.toMatchObject({ code: 11000 });
  });

  it('never returns a visitor id, not even to the visitor', async () => {
    const visitorId = crypto.randomUUID();
    const result = await answer(visitorId, { storyText: 'We still hang them every Saturday.' });

    expect(JSON.stringify(result)).not.toContain(visitorId);
    expect(JSON.stringify(await publicView(visitorId))).not.toContain(visitorId);
    expect(JSON.stringify(await publicView())).not.toContain(visitorId);
  });

  it('parses identifiers instead of trusting them', async () => {
    expect((await answer('not-a-uuid')).kind).toBe('invalid');
    expect((await chain.answer({ entryId, passedDown: true, kept: true })).kind).toBe('invalid');
    expect((await answer(crypto.randomUUID(), { entryId: { $ne: null } })).kind).toBe('invalid');
    expect((await answer(crypto.randomUUID(), { passedDown: 'yes' })).kind).toBe('invalid');
    expect((await answer(crypto.randomUUID(), { entryId: 'no-such-entry' })).kind).toBe('notFound');
    expect(await mongo.db.collection('chainEntries').countDocuments()).toBe(0);
  });

  it('holds stories that break the posting rules', async () => {
    const phone = await answer(crypto.randomUUID(), { storyText: 'Call my uncle on +91 98765 43210, he knows.' });
    const slur = await answer(crypto.randomUUID(), { storyText: 'Only n1gg3r families do this.' });

    expect(phone).toMatchObject({ kind: 'rejected', guardrail: 'heldForEdit' });
    expect(slur).toMatchObject({ kind: 'rejected', guardrail: 'blocked' });
    expect(await mongo.db.collection('chainEntries').countDocuments()).toBe(0);
  });

  it('rate limits stories but not a plain answer', async () => {
    const visitorId = crypto.randomUUID();
    const otherEntry = await postTestEntry(mongo.db);
    await answer(visitorId, { storyText: 'One story.' });

    const tooSoon = await chain.answer(
      { visitorId, entryId: otherEntry, passedDown: true, kept: true, storyText: 'Another story right away.' },
      later(5)
    );
    const plain = await chain.answer({ visitorId, entryId: otherEntry, passedDown: true, kept: true }, later(5));

    expect(tooSoon.kind).toBe('rateLimited');
    expect(plain.kind).toBe('saved');
  });

  it('lets a visitor reword their own story straight away, still through the guardrails', async () => {
    const visitorId = crypto.randomUUID();
    await answer(visitorId, { storyText: 'First telling.' });

    const reworded = await answer(visitorId, { storyText: 'Second, better telling.' }, later(2));
    const withPhone = await answer(visitorId, { storyText: 'Ring me on +91 98765 43210.' }, later(4));

    expect(reworded.kind).toBe('saved');
    expect(withPhone).toMatchObject({ kind: 'rejected', guardrail: 'heldForEdit' });
    expect((await publicView()).stories.map((story) => story.text)).toEqual(['Second, better telling.']);
  });

  it(`takes a story off the entry page once ${FLAG_THRESHOLD} visitors flag it`, async () => {
    const result = await answer(crypto.randomUUID(), { storyText: 'A story someone objects to.' });
    if (result.kind !== 'saved') throw new Error(result.kind);
    const [story] = result.view.stories;

    for (let i = 0; i < FLAG_THRESHOLD; i++) {
      await flagTarget(mongo.db, { visitorId: crypto.randomUUID(), targetType: 'chainEntry', targetId: story.id, reason: 'offensive' });
    }

    const view = await publicView();
    expect(view.stories).toEqual([]);
    expect(view.tally).toEqual({ keptIt: 0, droppedIt: 1, pickedItUp: 0, neverHadIt: 0 });
  });

  it('keeps counting an answer whose story was taken down', async () => {
    const visitorId = crypto.randomUUID();
    const saved = await answer(visitorId, { storyText: 'Taken down later.' });
    if (saved.kind !== 'saved') throw new Error(saved.kind);
    await applyStatusEvent(mongo.db, { targetType: 'chainEntry', targetId: saved.view.stories[0].id }, 'remove', 'admin');

    const view = await publicView(visitorId);
    expect(view.tally.droppedIt).toBe(1);
    expect(view.stories).toEqual([]);
    expect(view.mine).toMatchObject({ status: 'removed', storyText: 'Taken down later.' });
  });

  it('serves nothing under an entry that left public pages', async () => {
    await answer(crypto.randomUUID(), { storyText: 'A story under an entry that gets hidden.' });
    await applyStatusEvent(mongo.db, { targetType: 'entry', targetId: entryId }, 'hide', 'admin');

    expect(await chain.view(entryId, null)).toBeNull();
    expect((await answer(crypto.randomUUID())).kind).toBe('notFound');
  });
});
