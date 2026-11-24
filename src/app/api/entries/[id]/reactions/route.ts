import { NextRequest, NextResponse } from 'next/server';
import { badJsonResponse, failureResponse } from '@/lib/entries/http';
import { getReactionStore } from '@/lib/reactions/store';
import { requestVisitorId, withVisitor } from '@/lib/visitorSession';

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const store = await getReactionStore();
    const view = await store.view(id, requestVisitorId(request));
    return view ? NextResponse.json(view) : failureResponse({ kind: 'notFound' });
  } catch (error) {
    console.error('GET /api/entries/[id]/reactions error:', error);
    return NextResponse.json({ error: 'Failed to load reactions' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Context) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badJsonResponse();
  }

  try {
    const { id } = await params;
    const store = await getReactionStore();
    const result = await store.set({ ...withVisitor(request, body), entryId: id });
    return result.kind === 'saved' ? NextResponse.json(result.view) : failureResponse(result);
  } catch (error) {
    console.error('PUT /api/entries/[id]/reactions error:', error);
    return NextResponse.json({ error: 'Failed to save reaction' }, { status: 500 });
  }
}
