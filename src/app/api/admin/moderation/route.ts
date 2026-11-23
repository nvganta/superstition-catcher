import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isAdminPassword } from '@/lib/admin-auth';
import { getDb } from '@/lib/mongodb';
import { badJsonResponse, failureResponse } from '@/lib/entries/http';
import { issuesFrom } from '@/lib/entries/results';
import { listChainStoriesForAdmin, listModerationQueue } from '@/lib/moderation/queue';
import { applyStatusEvent } from '@/lib/moderation/transitions';
import { flagTargetTypeSchema } from '@/lib/schema/flag';
import { statusEventSchema } from '@/lib/schema/statusTransition';

const transitionInputSchema = z.object({
  targetType: flagTargetTypeSchema,
  targetId: z.string().min(1).max(120),
  event: statusEventSchema,
});

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function GET(request: NextRequest) {
  if (!isAdminPassword(request.headers.get('x-admin-password'))) {
    return unauthorized();
  }

  try {
    const db = await getDb();
    const [queue, stories] = await Promise.all([listModerationQueue(db), listChainStoriesForAdmin(db)]);
    return NextResponse.json({ queue, stories });
  } catch (error) {
    console.error('GET /api/admin/moderation error:', error);
    return NextResponse.json({ error: 'Failed to load the moderation queue' }, { status: 500 });
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

  const parsed = transitionInputSchema.safeParse(body);
  if (!parsed.success) {
    return failureResponse({ kind: 'invalid', issues: issuesFrom(parsed.error) });
  }

  try {
    const { event, ...ref } = parsed.data;
    const result = await applyStatusEvent(await getDb(), ref, event, 'admin');
    return result.kind === 'transitioned' ? NextResponse.json(result) : failureResponse(result);
  } catch (error) {
    console.error('POST /api/admin/moderation error:', error);
    return NextResponse.json({ error: 'Failed to change status' }, { status: 500 });
  }
}
