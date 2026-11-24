import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { badJsonResponse, failureResponse } from '@/lib/entries/http';
import { flagTarget } from '@/lib/moderation/flags';
import { withVisitor } from '@/lib/visitorSession';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badJsonResponse();
  }

  try {
    const result = await flagTarget(await getDb(), withVisitor(request, body));
    switch (result.kind) {
      case 'recorded':
        return NextResponse.json({ recorded: true }, { status: 201 });
      case 'alreadyFlagged':
        return NextResponse.json({ recorded: false, alreadyFlagged: true });
      default:
        return failureResponse(result);
    }
  } catch (error) {
    console.error('POST /api/flags error:', error);
    return NextResponse.json({ error: 'Failed to record flag' }, { status: 500 });
  }
}
