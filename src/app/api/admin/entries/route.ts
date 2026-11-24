import { NextRequest, NextResponse } from 'next/server';
import { isAdminPassword } from '@/lib/admin-auth';
import { getEntryStore } from '@/lib/entries/store';
import { badJsonResponse, writeResultResponse } from '@/lib/entries/http';

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function GET(request: NextRequest) {
  if (!isAdminPassword(request.headers.get('x-admin-password'))) {
    return unauthorized();
  }

  try {
    const store = await getEntryStore();
    return NextResponse.json(await store.listAllForAdmin());
  } catch (error) {
    console.error('GET /api/admin/entries error:', error);
    return NextResponse.json({ error: 'Failed to list entries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminPassword(request.headers.get('x-admin-password'))) {
    return unauthorized();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badJsonResponse();
  }

  try {
    const store = await getEntryStore();
    return writeResultResponse(await store.createCurated(body));
  } catch (error) {
    console.error('POST /api/admin/entries error:', error);
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
  }
}
