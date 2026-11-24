import { NextRequest, NextResponse } from 'next/server';
import { isAdminPassword } from '@/lib/admin-auth';
import { getEntryStore } from '@/lib/entries/store';
import { badJsonResponse, writeResultResponse } from '@/lib/entries/http';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdminPassword(request.headers.get('x-admin-password'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badJsonResponse();
  }

  try {
    const { id } = await params;
    const store = await getEntryStore();
    return writeResultResponse(await store.update(id, body));
  } catch (error) {
    console.error('PUT /api/admin/entries/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 });
  }
}
