import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { getPublishedAiNote } from '@/lib/aiNotes/store';
import { CURATED_ENTRY } from '@/test/fixtures';
import { startTestMongo, type TestMongo } from '@/test/mongoServer';
import { POST as applyEvent } from '../../../notes/[id]/route';
import { GET, POST } from './route';

let mongo: TestMongo;
const PASSWORD = 'test-admin';
const saved = { ...process.env };

function request(url: string, init: { method?: string; password?: string; body?: unknown } = {}) {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (init.password !== undefined) headers.set('x-admin-password', init.password);
  return new NextRequest(`http://localhost${url}`, {
    method: init.method ?? 'GET',
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
}

const entryContext = { params: Promise.resolve({ id: CURATED_ENTRY }) };

beforeAll(async () => {
  mongo = await startTestMongo({ migrate: true });
});

afterEach(() => {
  process.env = { ...saved };
});

afterAll(async () => {
  await mongo.stop();
});

function configure(env: Record<string, string>) {
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.AI_NOTES_PROVIDER;
  Object.assign(process.env, { ADMIN_PASSWORD: PASSWORD, MONGODB_URI: mongo.uri }, env);
}

describe('admin AI note routes', () => {
  it('need the admin password', async () => {
    configure({ AI_NOTES_PROVIDER: 'stub' });
    expect((await GET(request('/x'), entryContext)).status).toBe(401);
    expect((await POST(request('/x', { method: 'POST', password: 'wrong' }), entryContext)).status).toBe(401);
  });

  it('say AI notes are not configured when no key is set, and change nothing', async () => {
    configure({});
    const list = await GET(request('/x', { password: PASSWORD }), entryContext);
    expect(await list.json()).toEqual({ configured: false, notes: [] });

    const generated = await POST(request('/x', { method: 'POST', password: PASSWORD }), entryContext);
    expect(generated.status).toBe(503);
    expect(await generated.json()).toMatchObject({ error: 'notConfigured' });
    expect(await mongo.db.collection('aiNotes').countDocuments()).toBe(0);
  });

  it('generate a draft with the stub, then publish it to the entry page', async () => {
    configure({ AI_NOTES_PROVIDER: 'stub' });
    const generated = await POST(request('/x', { method: 'POST', password: PASSWORD }), entryContext);
    expect(generated.status).toBe(201);
    const { note } = await generated.json();
    expect(note).toMatchObject({ status: 'draft', model: 'stub', promptVersion: 'stub-v1', entryId: CURATED_ENTRY });
    expect(await getPublishedAiNote(CURATED_ENTRY)).toBeNull();

    const published = await applyEvent(
      request('/x', { method: 'POST', password: PASSWORD, body: { event: 'publish' } }),
      { params: Promise.resolve({ id: note.id }) }
    );
    expect(published.status).toBe(200);
    expect(await getPublishedAiNote(CURATED_ENTRY)).toMatchObject({ body: note.body, model: 'stub' });

    const again = await applyEvent(
      request('/x', { method: 'POST', password: PASSWORD, body: { event: 'publish' } }),
      { params: Promise.resolve({ id: note.id }) }
    );
    expect(again.status).toBe(409);
  });
});
