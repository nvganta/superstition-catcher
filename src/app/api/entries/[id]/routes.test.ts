import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { startTestMongo, type TestMongo } from '@/test/mongoServer';
import { postTestEntry } from '@/test/fixtures';
import { VISITOR_COOKIE } from '@/lib/visitorCookie';
import * as chainRoute from './chain/route';
import * as reactionsRoute from './reactions/route';
import { POST as postFlag } from '../../flags/route';
import * as moderationRoute from '../../admin/moderation/route';
import { applyStatusEvent } from '@/lib/moderation/transitions';

let mongo: TestMongo;
let entryId: string;

function request(path: string, { method = 'GET', visitorId, body }: { method?: string; visitorId?: string; body?: unknown } = {}) {
  return new NextRequest(`http://localhost${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(visitorId ? { cookie: `${VISITOR_COOKIE}=${visitorId}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

const context = () => ({ params: Promise.resolve({ id: entryId }) });

beforeAll(async () => {
  mongo = await startTestMongo();
  process.env.MONGODB_URI = mongo.uri;
  process.env.ADMIN_PASSWORD = 'test-admin';
});

beforeEach(async () => {
  await mongo.reset();
  entryId = await postTestEntry(mongo.db);
});

afterAll(async () => {
  await mongo.stop();
});

describe('visitor routes', () => {
  it('answers the chain as the cookie visitor and never sends the id back', async () => {
    const visitorId = crypto.randomUUID();
    const someoneElse = crypto.randomUUID();
    const put = await chainRoute.PUT(
      request(`/api/entries/${entryId}/chain`, {
        method: 'PUT',
        visitorId,
        body: { visitorId: someoneElse, passedDown: true, kept: true, storyText: 'Still do it.' },
      }),
      context()
    );
    const putText = await put.text();

    expect(put.status).toBe(200);
    expect(await mongo.db.collection('chainEntries').findOne({ entryId })).toMatchObject({ visitorId });
    expect(putText).not.toContain(visitorId);
    expect(putText).not.toContain(someoneElse);

    const mine = await chainRoute.GET(request(`/api/entries/${entryId}/chain`, { visitorId }), context());
    const mineText = await mine.text();
    expect(JSON.parse(mineText).mine).toMatchObject({ passedDown: true, kept: true, storyText: 'Still do it.' });
    expect(mineText).not.toContain(visitorId);

    const anonymous = await chainRoute.GET(request(`/api/entries/${entryId}/chain`), context());
    expect((await anonymous.json()).mine).toBeNull();
  });

  it('refuses a write from a browser without a visitor cookie', async () => {
    const body = { visitorId: crypto.randomUUID(), kind: 'save', value: true };
    const res = await reactionsRoute.PUT(request(`/api/entries/${entryId}/reactions`, { method: 'PUT', body }), context());

    expect(res.status).toBe(400);
    expect(await mongo.db.collection('reactions').countDocuments()).toBe(0);
  });

  it('saves a reaction for the cookie visitor', async () => {
    const visitorId = crypto.randomUUID();
    const res = await reactionsRoute.PUT(
      request(`/api/entries/${entryId}/reactions`, { method: 'PUT', visitorId, body: { kind: 'hide', value: true } }),
      context()
    );

    expect(await res.json()).toEqual({ rating: { average: null, count: 0 }, mine: { rating: null, saved: false, hidden: true } });
    expect(await mongo.db.collection('reactions').findOne({ entryId })).toMatchObject({ visitorId, kind: 'hide' });
  });

  it('records a flag for the cookie visitor', async () => {
    const visitorId = crypto.randomUUID();
    const res = await postFlag(
      request('/api/flags', { method: 'POST', visitorId, body: { targetType: 'entry', targetId: entryId, reason: 'spam' } })
    );

    expect(res.status).toBe(201);
    expect(await mongo.db.collection('flags').findOne({ targetId: entryId })).toMatchObject({ visitorId });

    const again = await postFlag(
      request('/api/flags', { method: 'POST', visitorId, body: { targetType: 'entry', targetId: entryId, reason: 'spam' } })
    );
    expect(await again.json()).toEqual({ recorded: false, alreadyFlagged: true });
  });

  it('returns 404 for the chain and reactions of an entry that left public pages', async () => {
    await applyStatusEvent(mongo.db, { targetType: 'entry', targetId: entryId }, 'hide', 'admin');

    expect((await chainRoute.GET(request(`/api/entries/${entryId}/chain`), context())).status).toBe(404);
    expect((await reactionsRoute.GET(request(`/api/entries/${entryId}/reactions`), context())).status).toBe(404);
  });

  it('keeps the moderation queue and its actions behind the admin password', async () => {
    const wrong = { 'Content-Type': 'application/json', 'x-admin-password': 'guess' };
    const get = await moderationRoute.GET(new NextRequest('http://localhost/api/admin/moderation', { headers: wrong }));
    const post = await moderationRoute.POST(
      new NextRequest('http://localhost/api/admin/moderation', {
        method: 'POST',
        headers: wrong,
        body: JSON.stringify({ targetType: 'entry', targetId: entryId, event: 'remove' }),
      })
    );

    expect([get.status, post.status]).toEqual([401, 401]);
    expect(await mongo.db.collection('entries').findOne({ id: entryId })).toMatchObject({ status: 'live' });
  });
});
