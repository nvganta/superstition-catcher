import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isAdminPassword } from '@/lib/admin-auth';
import { getAiNoteStore } from '@/lib/aiNotes/store';
import { badJsonResponse, failureResponse } from '@/lib/entries/http';
import { issuesFrom } from '@/lib/entries/results';
import { aiNoteEventSchema } from '@/lib/schema/aiNote';

type Context = { params: Promise<{ id: string }> };

const noteEventInputSchema = z.object({ event: aiNoteEventSchema });

export async function POST(request: NextRequest, { params }: Context) {
  if (!isAdminPassword(request.headers.get('x-admin-password'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badJsonResponse();
  }

  const parsed = noteEventInputSchema.safeParse(body);
  if (!parsed.success) {
    return failureResponse({ kind: 'invalid', issues: issuesFrom(parsed.error) });
  }

  try {
    const { id } = await params;
    const result = await (await getAiNoteStore()).apply(id, parsed.data.event);
    return result.kind === 'changed' ? NextResponse.json({ note: result.note }) : failureResponse(result);
  } catch (error) {
    console.error('POST /api/admin/notes/[id] error:', error);
    return NextResponse.json({ error: 'Failed to change the note' }, { status: 500 });
  }
}
