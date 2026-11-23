import { NextRequest, NextResponse } from 'next/server';
import { isAdminPassword } from '@/lib/admin-auth';
import { getAiNoteStore } from '@/lib/aiNotes/store';

type Context = { params: Promise<{ id: string }> };

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function GET(request: NextRequest, { params }: Context) {
  if (!isAdminPassword(request.headers.get('x-admin-password'))) {
    return unauthorized();
  }

  try {
    const { id } = await params;
    const store = await getAiNoteStore();
    return NextResponse.json({ configured: store.configured, notes: await store.listForEntry(id) });
  } catch (error) {
    console.error('GET /api/admin/entries/[id]/notes error:', error);
    return NextResponse.json({ error: 'Failed to load AI notes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: Context) {
  if (!isAdminPassword(request.headers.get('x-admin-password'))) {
    return unauthorized();
  }

  try {
    const { id } = await params;
    const result = await (await getAiNoteStore()).generate(id);
    switch (result.kind) {
      case 'created':
        return NextResponse.json({ note: result.note }, { status: 201 });
      case 'notConfigured':
        return NextResponse.json(
          { error: 'notConfigured', message: 'AI notes are not configured. Set ANTHROPIC_API_KEY to turn them on.' },
          { status: 503 }
        );
      case 'notFound':
        return NextResponse.json({ error: 'notFound', message: 'Not found.' }, { status: 404 });
      case 'failed':
        return NextResponse.json({ error: 'failed', message: result.message }, { status: 502 });
    }
  } catch (error) {
    console.error('POST /api/admin/entries/[id]/notes error:', error);
    return NextResponse.json({ error: 'Failed to generate an AI note' }, { status: 500 });
  }
}
