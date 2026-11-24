import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { startTestMongo, type TestMongo } from '@/test/mongoServer';
import { postTestEntry } from '@/test/fixtures';
import { createEntryStore, type EntryStore } from '@/lib/entries/store';
import { applyStatusEvent } from '@/lib/moderation/transitions';
import { createReactionStore, type ReactionStore } from './store';

let mongo: TestMongo;
let reactions: ReactionStore;
let entries: EntryStore;
let first: string;
let second: string;

beforeAll(async () => {
  mongo = await startTestMongo();
  reactions = createReactionStore(mongo.db);
  entries = createEntryStore(mongo.db);
});

beforeEach(async () => {
  await mongo.reset();
  first = await postTestEntry(mongo.db);
  second = await postTestEntry(mongo.db);
});

afterAll(async () => {
  await mongo.stop();
});

function react(visitorId: string, entryId: string, kind: string, value: unknown) {
  return reactions.set({ visitorId, entryId, kind, value });
}

describe('reactions', () => {
  it('averages ratings and lets a visitor change or clear theirs', async () => {
    const [a, b] = [crypto.randomUUID(), crypto.randomUUID()];
    await react(a, first, 'rate', 5);
    await react(b, first, 'rate', 2);
    await react(b, first, 'rate', 4);

    expect(await reactions.view(first, b)).toEqual({
      rating: { average: 4.5, count: 2 },
      mine: { rating: 4, saved: false, hidden: false },
    });

    await react(b, first, 'rate', null);
    expect((await reactions.view(first, b))!.rating).toEqual({ average: 5, count: 1 });
  });

  it('refuses ratings off the scale and reactions on entries that are not public', async () => {
    const visitorId = crypto.randomUUID();
    expect((await react(visitorId, first, 'rate', 6)).kind).toBe('invalid');
    expect((await react(visitorId, first, 'like', true)).kind).toBe('invalid');
    expect((await react('not-a-uuid', first, 'save', true)).kind).toBe('invalid');

    await applyStatusEvent(mongo.db, { targetType: 'entry', targetId: second }, 'hide', 'admin');
    expect((await react(visitorId, second, 'save', true)).kind).toBe('notFound');
    expect(await reactions.view(second, visitorId)).toBeNull();
    expect(await mongo.db.collection('reactions').countDocuments()).toBe(0);
  });

  it('lists saved entries newest first and leaves other visitors alone', async () => {
    const visitorId = crypto.randomUUID();
    await reactions.set({ visitorId, entryId: first, kind: 'save', value: true }, new Date('2026-11-23T09:00:00Z'));
    await reactions.set({ visitorId, entryId: second, kind: 'save', value: true }, new Date('2026-11-23T10:00:00Z'));

    expect((await reactions.listForVisitor(visitorId)).saved.map((entry) => entry.id)).toEqual([second, first]);
    expect((await reactions.listForVisitor(crypto.randomUUID())).saved).toEqual([]);
    expect((await reactions.listForVisitor(null)).saved).toEqual([]);

    await react(visitorId, first, 'save', false);
    expect((await reactions.listForVisitor(visitorId)).saved.map((entry) => entry.id)).toEqual([second]);
  });

  it('drops a hidden entry from that visitor’s feed only, until they unhide it', async () => {
    const [hider, other] = [crypto.randomUUID(), crypto.randomUUID()];
    await react(hider, first, 'hide', true);

    const feedFor = async (visitorId: string) =>
      (await entries.listLive({ excludeIds: await reactions.hiddenEntryIds(visitorId) })).map((entry) => entry.id);

    expect(await feedFor(hider)).not.toContain(first);
    expect(await feedFor(hider)).toContain(second);
    expect(await feedFor(other)).toContain(first);
    expect((await reactions.listForVisitor(hider)).hidden.map((entry) => entry.id)).toEqual([first]);

    await react(hider, first, 'hide', false);
    expect(await feedFor(hider)).toContain(first);
  });

  it('never returns a visitor id', async () => {
    const visitorId = crypto.randomUUID();
    const result = await react(visitorId, first, 'rate', 3);
    expect(JSON.stringify(result)).not.toContain(visitorId);
    expect(JSON.stringify(await reactions.listForVisitor(visitorId))).not.toContain(visitorId);
  });
});
