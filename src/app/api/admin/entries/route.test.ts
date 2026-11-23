import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { startTestMongo, type TestMongo } from '@/test/mongoServer';
import { POST as login } from '../auth/route';
import { GET, POST } from './route';
import { PUT } from './[id]/route';

let mongo: TestMongo;
const originalPassword = process.env.ADMIN_PASSWORD;

function request(url: string, init: { method?: string; password?: string; body?: unknown } = {}) {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (init.password !== undefined) headers.set('x-admin-password', init.password);
  return new NextRequest(`http://localhost${url}`, {
    method: init.method ?? 'GET',
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
}

const curated = {
  title: 'Touching the feet of elders',
  country: 'India',
  countryFlag: '🇮🇳',
  region: 'india',
  categorySlugs: ['family'],
  theDefault: 'Bend and touch an elder’s feet when you greet them.',
  whyItStarted: 'A gesture of deference recorded in early household codes.',
  whyItStuck: 'It is a visible, daily way to show respect.',
  whatsChangedSince: 'Many families now reserve it for festivals and weddings.',
  confidence: 'established',
  sources: [{ title: 'Household Rituals of North India', kind: 'book' }],
};

beforeAll(async () => {
  mongo = await startTestMongo({ migrate: true });
  process.env.MONGODB_URI = mongo.uri;
});

afterEach(() => {
  process.env.ADMIN_PASSWORD = originalPassword;
});

afterAll(async () => {
  await mongo.stop();
});

describe('admin auth', () => {
  it('rejects every password, including an empty one, when ADMIN_PASSWORD is unset', async () => {
    delete process.env.ADMIN_PASSWORD;

    expect((await login(request('/api/admin/auth', { method: 'POST', body: {} }))).status).toBe(401);
    expect((await login(request('/api/admin/auth', { method: 'POST', body: { password: '' } }))).status).toBe(401);
    expect((await GET(request('/api/admin/entries', { password: '' }))).status).toBe(401);
    expect((await GET(request('/api/admin/entries'))).status).toBe(401);
  });

  it('rejects an empty password when ADMIN_PASSWORD is an empty string', async () => {
    process.env.ADMIN_PASSWORD = '';
    expect((await GET(request('/api/admin/entries', { password: '' }))).status).toBe(401);
  });

  it('rejects the wrong password and accepts the right one', async () => {
    process.env.ADMIN_PASSWORD = 'test-admin-secret';

    expect((await GET(request('/api/admin/entries', { password: 'nope' }))).status).toBe(401);
    expect((await login(request('/api/admin/auth', { method: 'POST', body: { password: 'test-admin-secret' } }))).status).toBe(200);
    expect((await GET(request('/api/admin/entries', { password: 'test-admin-secret' }))).status).toBe(200);
  });
});

describe('admin entry routes', () => {
  it('creates a curated entry and versions an edit', async () => {
    process.env.ADMIN_PASSWORD = 'test-admin-secret';

    const created = await POST(request('/api/admin/entries', { method: 'POST', password: 'test-admin-secret', body: curated }));
    expect(created.status).toBe(201);
    const { entry } = await created.json();

    const edited = await PUT(
      request(`/api/admin/entries/${entry.id}`, {
        method: 'PUT',
        password: 'test-admin-secret',
        body: { ...curated, freshLook: 'Respect can be shown many ways.', version: 1 },
      }),
      { params: Promise.resolve({ id: entry.id }) }
    );
    expect(edited.status).toBe(200);
    expect((await edited.json()).entry.version).toBe(2);

    const stale = await PUT(
      request(`/api/admin/entries/${entry.id}`, {
        method: 'PUT',
        password: 'test-admin-secret',
        body: { ...curated, version: 1 },
      }),
      { params: Promise.resolve({ id: entry.id }) }
    );
    expect(stale.status).toBe(409);
  });

  it('returns 400 with the schema message when confidence is missing', async () => {
    process.env.ADMIN_PASSWORD = 'test-admin-secret';
    const { confidence, ...withoutConfidence } = curated;
    void confidence;

    const res = await POST(
      request('/api/admin/entries', { method: 'POST', password: 'test-admin-secret', body: { ...withoutConfidence, title: 'No confidence' } })
    );

    expect(res.status).toBe(400);
    expect((await res.json()).issues).toContainEqual({
      field: 'confidence',
      message: 'Curated entries require a confidence level',
    });
  });

  it('does not let an unauthenticated caller edit', async () => {
    process.env.ADMIN_PASSWORD = 'test-admin-secret';
    const res = await PUT(
      request('/api/admin/entries/lemons-chillies-door', { method: 'PUT', body: { ...curated, version: 1 } }),
      { params: Promise.resolve({ id: 'lemons-chillies-door' }) }
    );
    expect(res.status).toBe(401);
  });
});
