import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/mongodb';
import { checkContent } from '@/lib/guardrails/checkContent';
import { createEntryStore } from '@/lib/entries/store';

const COMMENTS_SHOWN = 200;

const commentInputSchema = z.object({
  superstitionId: z.string().min(1).max(120),
  name: z.string().trim().min(1, 'Name is required').max(50, 'Name too long (max 50 chars)'),
  text: z.string().trim().min(1, 'Comment is required').max(1000, 'Comment too long (max 1000 chars)'),
});

function notFound() {
  return NextResponse.json({ error: 'notFound', message: 'Entry not found.' }, { status: 404 });
}

// GET comments for a live entry. Comments under hidden or removed entries stay hidden too.
export async function GET(request: NextRequest) {
  const superstitionId = request.nextUrl.searchParams.get('superstitionId');
  if (!superstitionId) {
    return NextResponse.json({ error: 'superstitionId required' }, { status: 400 });
  }

  try {
    const db = await getDb();
    if (!(await createEntryStore(db).getLive(superstitionId))) {
      return notFound();
    }

    const comments = await db
      .collection('comments')
      .find({ superstitionId })
      .project({ _id: 1, superstitionId: 1, name: 1, text: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .limit(COMMENTS_SHOWN)
      .toArray();

    return NextResponse.json(comments);
  } catch (error) {
    console.error('GET /api/comments error:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// POST a comment. It passes the same slur, contact-detail and link checks as a chain story.
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid', message: 'Request body must be JSON.' }, { status: 400 });
  }

  const parsed = commentInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid', message: parsed.error.issues[0]?.message ?? 'Some fields need attention.' },
      { status: 400 }
    );
  }
  const { superstitionId, name, text } = parsed.data;

  try {
    const db = await getDb();
    if (!(await createEntryStore(db).getLive(superstitionId))) {
      return notFound();
    }

    const check = checkContent({ contentType: 'chainStory', fields: { chainText: text, postedBy: name } });
    if (check.result !== 'passed') {
      return NextResponse.json(
        {
          error: check.result,
          message:
            check.result === 'heldForEdit'
              ? 'Please remove personal contact details before posting.'
              : 'This comment breaks our posting rules.',
        },
        { status: 422 }
      );
    }

    const comment = { superstitionId, name, text, createdAt: new Date() };
    await db.collection('comments').insertOne({ ...comment });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('POST /api/comments error:', error);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}
