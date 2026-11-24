import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { startTestMongo, type TestMongo } from '@/test/mongoServer';
import { GET, POST } from './route';

const ENTRY_ID = 'lemons-chillies-door';
let mongo: TestMongo;

function postComment(body: Record<string, unknown>) {
  return POST(
    new NextRequest('http://localhost/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ superstitionId: ENTRY_ID, name: 'Asha', text: 'My grandmother did this every Friday.', ...body }),
    })
  );
}

function getComments(id = ENTRY_ID) {
  return GET(new NextRequest(`http://localhost/api/comments?superstitionId=${id}`));
}

beforeAll(async () => {
  mongo = await startTestMongo({ migrate: true });
  process.env.MONGODB_URI = mongo.uri;
});

beforeEach(async () => {
  await mongo.reset();
});

afterAll(async () => {
  await mongo.stop();
});

describe('/api/comments', () => {
  it('posts a clean comment and lists it under the live entry', async () => {
    expect((await postComment({})).status).toBe(201);
    const comments = await (await getComments()).json();
    expect(comments.map((comment: { text: string }) => comment.text)).toEqual(['My grandmother did this every Friday.']);
  });

  it('holds contact details and blocks links like any other post', async () => {
    expect((await postComment({ text: 'Call me on +91 98765 43210' })).status).toBe(422);
    expect((await postComment({ text: 'More at cheap-pills.xyz/buy' })).status).toBe(422);
    expect(await (await getComments()).json()).toEqual([]);
  });

  it('rejects non-string fields instead of storing them', async () => {
    expect((await postComment({ superstitionId: { $ne: null } })).status).toBe(400);
    expect((await postComment({ text: ['a'] })).status).toBe(400);
  });

  it('neither accepts nor serves comments under an entry that is not live', async () => {
    expect((await postComment({})).status).toBe(201);
    await mongo.db.collection('entries').updateOne({ id: ENTRY_ID }, { $set: { status: 'hidden' } });

    expect((await postComment({})).status).toBe(404);
    expect((await getComments()).status).toBe(404);
    expect((await postComment({ superstitionId: 'no-such-entry' })).status).toBe(404);
  });
});
