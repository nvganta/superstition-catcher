import { NextRequest, NextResponse } from 'next/server';
import { getChainStore } from '@/lib/chain/store';
import { badJsonResponse, failureResponse } from '@/lib/entries/http';
import { requestVisitorId, withVisitor } from '@/lib/visitorSession';

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const store = await getChainStore();
    const view = await store.view(id, requestVisitorId(request));
    return view ? NextResponse.json(view) : failureResponse({ kind: 'notFound' });
  } catch (error) {
    console.error('GET /api/entries/[id]/chain error:', error);
    return NextResponse.json({ error: 'Failed to load the chain' }, { status: 500 });
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
    const store = await getChainStore();
    const result = await store.answer({ ...withVisitor(request, body), entryId: id });
    return result.kind === 'saved' ? NextResponse.json(result.view) : failureResponse(result);
  } catch (error) {
    console.error('PUT /api/entries/[id]/chain error:', error);
    return NextResponse.json({ error: 'Failed to save your answer' }, { status: 500 });
  }
}
