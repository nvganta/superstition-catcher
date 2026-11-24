import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { startTestMongo, type TestMongo } from '@/test/mongoServer';
import { VISITOR_COOKIE } from '@/lib/visitorCookie';
import { GET, POST } from './route';

let mongo: TestMongo;

function postRequest(body: unknown, visitorId: string = crypto.randomUUID()) {
  return new NextRequest('http://localhost/api/entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', cookie: `${VISITOR_COOKIE}=${visitorId}` },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

function entry(overrides: Record<string, unknown> = {}) {
  return {
    title: 'Do not whistle at night',
    country: 'South Korea',
    region: 'china',
    categorySlugs: ['home'],
    theDefault: 'Whistling after dark calls snakes and spirits into the house.',
    whyItStarted: 'Night was dangerous and quiet households were safer households.',
    whyItStuck: 'Parents used it to keep children calm at bedtime.',
    whatsChangedSince: 'Most people now treat it as a joke from their grandparents.',
    ...overrides,
  };
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

describe('POST /api/entries', () => {
  it('returns 201 and the live entry is searchable straight away', async () => {
    const res = await POST(postRequest(entry()));
    expect(res.status).toBe(201);
    const { entry: created } = await res.json();
    expect(created.origin).toBe('community');

    const search = await GET(new NextRequest('http://localhost/api/entries?q=whistling'));
    expect((await search.json()).map((result: { id: string }) => result.id)).toContain(created.id);
  });

  it('returns 422 with a readable reason when guardrails hold the post', async () => {
    const res = await POST(postRequest(entry({ theDefault: 'Call my dad on +91 98765 43210 to hear it' })));

    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error).toBe('heldForEdit');
    expect(body.issues).toContainEqual({
      field: 'theDefault',
      message: 'Please remove phone numbers before posting.',
    });
  });

  it('returns 429 with Retry-After when the visitor posts again too soon', async () => {
    const visitorId = crypto.randomUUID();
    expect((await POST(postRequest(entry(), visitorId))).status).toBe(201);

    const res = await POST(postRequest(entry({ title: 'Another one' }), visitorId));

    expect(res.status).toBe(429);
    expect(Number(res.headers.get('Retry-After'))).toBeGreaterThan(0);
    expect((await res.json()).message).toMatch(/wait/i);
  });

  it('takes the poster from the visitor cookie and ignores a visitorId in the body', async () => {
    const visitorId = crypto.randomUUID();
    const res = await POST(postRequest(entry({ visitorId: crypto.randomUUID() }), visitorId));
    const { entry: created } = await res.json();

    expect(await mongo.db.collection('entries').findOne({ id: created.id })).toMatchObject({ postedByVisitorId: visitorId });
    expect(JSON.stringify(created)).not.toContain(visitorId);
  });

  it('returns 400 when the browser sent no usable visitor cookie', async () => {
    expect((await POST(postRequest(entry({ visitorId: crypto.randomUUID() }), 'not-a-uuid'))).status).toBe(400);
  });

  it('returns 400 for a body that is not JSON', async () => {
    expect((await POST(postRequest('not json'))).status).toBe(400);
  });
});

describe('GET /api/entries', () => {
  it('returns only summary fields for matches', async () => {
    const res = await GET(new NextRequest('http://localhost/api/entries?q=pungent'));
    expect(await res.json()).toEqual([
      {
        id: 'lemons-chillies-door',
        title: 'Hanging Lemons & Chillies at Doorways',
        country: 'India',
        countryFlag: '🇮🇳',
        origin: 'curated',
      },
    ]);
  });
});
