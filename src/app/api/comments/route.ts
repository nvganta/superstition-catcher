import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// GET comments for a superstition
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const superstitionId = searchParams.get('superstitionId');

    if (!superstitionId) {
      return NextResponse.json({ error: 'superstitionId required' }, { status: 400 });
    }

    const comments = await db
      .collection('comments')
      .find({ superstitionId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(comments);
  } catch (error) {
    console.error('GET /api/comments error:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

// POST a comment
export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const { superstitionId, name, text } = await request.json();

    if (!superstitionId || !name || !text) {
      return NextResponse.json(
        { error: 'superstitionId, name, and text required' },
        { status: 400 }
      );
    }

    if (name.length > 50) {
      return NextResponse.json({ error: 'Name too long (max 50 chars)' }, { status: 400 });
    }

    if (text.length > 1000) {
      return NextResponse.json({ error: 'Comment too long (max 1000 chars)' }, { status: 400 });
    }

    const comment = {
      superstitionId,
      name: name.trim(),
      text: text.trim(),
      createdAt: new Date(),
    };

    await db.collection('comments').insertOne(comment);

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('POST /api/comments error:', error);
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 });
  }
}
