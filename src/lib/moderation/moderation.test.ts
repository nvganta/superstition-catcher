import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { startTestMongo, type TestMongo } from '@/test/mongoServer';
import { CURATED_ENTRY, postTestEntry } from '@/test/fixtures';
import { createEntryStore, type EntryStore } from '@/lib/entries/store';
import { entryStatusSchema } from '@/lib/schema/common';
import { statusEventSchema } from '@/lib/schema/statusTransition';
import { ensureIndexes } from '../../../scripts/ensure-indexes';
import { flagTarget } from './flags';
import { listModerationQueue } from './queue';
import { FLAG_THRESHOLD, MAX_SYSTEM_TAKEDOWNS_PER_HOUR, nextStatus } from './statusMachine';
import { applyStatusEvent } from './transitions';

let mongo: TestMongo;
let store: EntryStore;

let ENTRY: string;
let ref: { targetType: 'entry'; targetId: string };
const now = new Date('2026-11-23T10:00:00Z');

function flag(visitorId = crypto.randomUUID(), overrides: Record<string, unknown> = {}) {
  return flagTarget(mongo.db, { visitorId, ...ref, reason: 'inaccurate', ...overrides }, now);
}

async function stored(id = ENTRY) {
  return mongo.db.collection('entries').findOne({ id });
}

beforeAll(async () => {
  mongo = await startTestMongo({ migrate: true });
  store = createEntryStore(mongo.db);
});

beforeEach(async () => {
  await mongo.reset();
  ENTRY = await postTestEntry(mongo.db);
  ref = { targetType: 'entry', targetId: ENTRY };
});

afterAll(async () => {
  await mongo.stop();
});

describe('status machine', () => {
  it('allows exactly the documented transitions', () => {
    const allowed = entryStatusSchema.options.flatMap((from) =>
      statusEventSchema.options.flatMap((event) =>
        (['system', 'admin'] as const).flatMap((actor) => {
          const to = nextStatus(from, event, actor);
          return to ? [`${from} -${event}/${actor}-> ${to}`] : [];
        })
      )
    );

    expect(allowed.sort()).toEqual(
      [
        'live -flagThresholdReached/system-> flagged',
        'live -dismissFlags/admin-> live',
        'live -startReview/admin-> underReview',
        'live -hide/admin-> hidden',
        'live -remove/admin-> removed',
        'flagged -startReview/admin-> underReview',
        'flagged -restore/admin-> live',
        'flagged -hide/admin-> hidden',
        'flagged -remove/admin-> removed',
        'underReview -restore/admin-> live',
        'underReview -hide/admin-> hidden',
        'underReview -remove/admin-> removed',
        'hidden -restore/admin-> live',
        'hidden -remove/admin-> removed',
      ].sort()
    );
  });

  it('records who changed the status and when', async () => {
    await applyStatusEvent(mongo.db, ref, 'startReview', 'admin', now);

    expect((await stored())?.status).toBe('underReview');
    expect(await mongo.db.collection('statusTransitions').find({}, { projection: { _id: 0 } }).toArray()).toEqual([
      { ...ref, entryId: ENTRY, event: 'startReview', from: 'live', to: 'underReview', actor: 'admin', at: now },
    ]);
  });

  it('refuses a transition the table does not allow and leaves the target unchanged', async () => {
    await applyStatusEvent(mongo.db, ref, 'remove', 'admin', now);

    const result = await applyStatusEvent(mongo.db, ref, 'restore', 'admin', now);

    expect(result.kind).toBe('refused');
    expect((await stored())?.status).toBe('removed');
    expect(await mongo.db.collection('statusTransitions').countDocuments()).toBe(1);
  });

  it('refuses an admin firing the system-only flag event', async () => {
    expect((await applyStatusEvent(mongo.db, ref, 'flagThresholdReached', 'admin', now)).kind).toBe('refused');
    expect((await stored())?.status).toBe('live');
  });

  it('applies a change once when two moderators press it together', async () => {
    const results = await Promise.all([
      applyStatusEvent(mongo.db, ref, 'hide', 'admin', now),
      applyStatusEvent(mongo.db, ref, 'hide', 'admin', now),
    ]);

    expect(results.filter((result) => result.kind === 'transitioned')).toHaveLength(1);
    expect(await mongo.db.collection('statusTransitions').countDocuments()).toBe(1);
  });
});

describe('flags', () => {
  it(`takes an entry off public pages once ${FLAG_THRESHOLD} visitors flag it`, async () => {
    for (let count = 1; count < FLAG_THRESHOLD; count++) {
      expect((await flag()).kind).toBe('recorded');
      expect(await store.getLive(ENTRY)).not.toBeNull();
      expect((await stored())?.flagCount).toBe(count);
    }

    expect((await flag()).kind).toBe('recorded');

    expect(await store.getLive(ENTRY)).toBeNull();
    expect((await store.listLive()).map((entry) => entry.id)).not.toContain(ENTRY);
    expect(await stored()).toMatchObject({ status: 'flagged', flagCount: FLAG_THRESHOLD });
    expect(await mongo.db.collection('statusTransitions').findOne({}, { projection: { _id: 0 } })).toMatchObject({
      event: 'flagThresholdReached',
      actor: 'system',
      from: 'live',
      to: 'flagged',
    });
  });

  it('queues a flagged curated entry for review but keeps it public', async () => {
    const curated = { targetType: 'entry' as const, targetId: CURATED_ENTRY };
    for (let i = 0; i < FLAG_THRESHOLD + 1; i++) {
      await flagTarget(mongo.db, { visitorId: crypto.randomUUID(), ...curated, reason: 'inaccurate' }, now);
    }

    expect(await stored(CURATED_ENTRY)).toMatchObject({ status: 'live', flagCount: FLAG_THRESHOLD + 1 });
    expect(await store.getLive(CURATED_ENTRY)).not.toBeNull();
    const [queued] = await listModerationQueue(mongo.db);
    expect(queued).toMatchObject({ targetId: CURATED_ENTRY, status: 'live' });
    expect(queued.events).toContain('dismissFlags');
  });

  it('dismissing reports keeps a live entry public and clears it from the queue', async () => {
    await flag();

    const result = await applyStatusEvent(mongo.db, ref, 'dismissFlags', 'admin', now);

    expect(result).toEqual({ kind: 'transitioned', from: 'live', to: 'live' });
    expect(await stored()).toMatchObject({ status: 'live', flagCount: 0 });
    expect(await listModerationQueue(mongo.db)).toEqual([]);
    expect((await flag()).kind).toBe('recorded');
    expect(await store.getLive(ENTRY)).not.toBeNull();
  });

  it(`stops hiding on flags after ${MAX_SYSTEM_TAKEDOWNS_PER_HOUR} automatic takedowns in an hour`, async () => {
    for (let i = 0; i < MAX_SYSTEM_TAKEDOWNS_PER_HOUR; i++) {
      const other = await postTestEntry(mongo.db);
      for (let j = 0; j < FLAG_THRESHOLD; j++) {
        await flagTarget(mongo.db, { visitorId: crypto.randomUUID(), targetType: 'entry', targetId: other, reason: 'spam' }, now);
      }
      expect((await stored(other))?.status).toBe('flagged');
    }

    for (let j = 0; j < FLAG_THRESHOLD; j++) await flag();

    expect(await stored()).toMatchObject({ status: 'live', flagCount: FLAG_THRESHOLD });
    expect((await listModerationQueue(mongo.db)).map((item) => item.targetId)).toContain(ENTRY);

    const anHourLater = new Date(now.getTime() + 61 * 60 * 1000);
    await flagTarget(mongo.db, { visitorId: crypto.randomUUID(), ...ref, reason: 'spam' }, anHourLater);
    expect((await stored())?.status).toBe('flagged');
  });

  it('replaces the old any-flag-ever unique index when indexes are ensured', async () => {
    await mongo.db.collection('flags').dropIndexes();
    await mongo.db.collection('flags').createIndex({ targetType: 1, targetId: 1, visitorId: 1 }, { unique: true, name: 'flags_target_visitor_unique' });

    await ensureIndexes(mongo.db);
    await ensureIndexes(mongo.db);

    const names = (await mongo.db.collection('flags').indexes()).map((index) => index.name);
    expect(names).toContain('flags_target_visitor_open_unique');
    expect(names).not.toContain('flags_target_visitor_unique');
  });

  it('lets one visitor report several things in a row', async () => {
    const visitorId = crypto.randomUUID();
    const other = await postTestEntry(mongo.db);

    expect((await flag(visitorId)).kind).toBe('recorded');
    expect((await flagTarget(mongo.db, { visitorId, targetType: 'entry', targetId: other, reason: 'spam' }, now)).kind).toBe('recorded');
  });

  it('counts one flag per visitor however often they press it', async () => {
    const visitorId = crypto.randomUUID();
    await flag(visitorId);

    expect((await flag(visitorId, { reason: 'spam' })).kind).toBe('alreadyFlagged');

    expect(await stored()).toMatchObject({ status: 'live', flagCount: 1 });
  });

  it('restoring dismisses the flags, and a reporter can report the restored entry again', async () => {
    const [first, second] = [crypto.randomUUID(), crypto.randomUUID()];
    await flag(first);
    await flag(second);

    await applyStatusEvent(mongo.db, ref, 'restore', 'admin', now);

    expect(await stored()).toMatchObject({ status: 'live', flagCount: 0 });
    expect(await mongo.db.collection('flags').countDocuments({ resolution: 'dismissed' })).toBe(2);
    expect((await flag(first)).kind).toBe('recorded');
    expect((await flag(first)).kind).toBe('alreadyFlagged');
    expect(await stored()).toMatchObject({ status: 'live', flagCount: 1 });
  });

  it('refuses flags on an entry that is not public', async () => {
    await applyStatusEvent(mongo.db, ref, 'hide', 'admin', now);
    expect((await flag()).kind).toBe('notFound');
  });

  it('parses identifiers instead of trusting them', async () => {
    expect((await flag(crypto.randomUUID(), { targetId: { $ne: null } })).kind).toBe('invalid');
    expect((await flag('not-a-uuid')).kind).toBe('invalid');
    expect(await mongo.db.collection('flags').countDocuments()).toBe(0);
  });

  it('accepts contact details in a private note but blocks slurs', async () => {
    expect((await flag(crypto.randomUUID(), { note: 'It lists my number, 98765 43210' })).kind).toBe('recorded');
    expect(await flag(crypto.randomUUID(), { note: 'n1gg3r' })).toMatchObject({ kind: 'rejected', guardrail: 'blocked' });
    expect((await stored())?.flagCount).toBe(1);
  });

  it('groups open flags by target in the admin queue without visitor ids', async () => {
    const visitorId = crypto.randomUUID();
    await flag(visitorId, { note: 'The date is wrong' });
    await flag(crypto.randomUUID(), { reason: 'spam' });

    const queue = await listModerationQueue(mongo.db);

    expect(queue).toHaveLength(1);
    expect(queue[0]).toMatchObject({ targetType: 'entry', targetId: ENTRY, status: 'flagged' });
    expect(queue[0].openFlags.map((open) => open.reason).sort()).toEqual(['inaccurate', 'spam']);
    expect(queue[0].events.sort()).toEqual(['hide', 'remove', 'restore', 'startReview']);
    expect(queue[0].openFlags).toHaveLength(FLAG_THRESHOLD);
    expect(JSON.stringify(queue)).not.toContain(visitorId);
  });
});
