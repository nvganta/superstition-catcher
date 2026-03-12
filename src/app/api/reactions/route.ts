import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// GET reactions for a superstition
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const superstitionId = searchParams.get('superstitionId');

    if (!superstitionId) {
      return NextResponse.json({ error: 'superstitionId required' }, { status: 400 });
    }

    const reactions = await db
      .collection('reactions')
      .aggregate([
        { $match: { superstitionId } },
        {
          $group: {
            _id: '$type',
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const counts = { like: 0, dislike: 0, mind_blown: 0 };
    for (const r of reactions) {
      if (r._id in counts) {
        counts[r._id as keyof typeof counts] = r.count;
      }
    }

    return NextResponse.json(counts);
  } catch (error) {
    console.error('GET /api/reactions error:', error);
    return NextResponse.json({ error: 'Failed to fetch reactions' }, { status: 500 });
  }
}

// POST a reaction
export async function POST(request: NextRequest) {
  try {
    const db = await getDb();
    const { superstitionId, type, visitorId } = await request.json();

    if (!superstitionId || !type || !visitorId) {
      return NextResponse.json(
        { error: 'superstitionId, type, and visitorId required' },
        { status: 400 }
      );
    }

    if (!['like', 'dislike', 'mind_blown'].includes(type)) {
      return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 });
    }

    // Remove any existing reaction from this visitor on this superstition
    await db.collection('reactions').deleteMany({ superstitionId, visitorId });

    // Add new reaction
    await db.collection('reactions').insertOne({
      superstitionId,
      type,
      visitorId,
      createdAt: new Date(),
    });

    // Return updated counts
    const reactions = await db
      .collection('reactions')
      .aggregate([
        { $match: { superstitionId } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ])
      .toArray();

    const counts = { like: 0, dislike: 0, mind_blown: 0 };
    for (const r of reactions) {
      if (r._id in counts) {
        counts[r._id as keyof typeof counts] = r.count;
      }
    }

    return NextResponse.json(counts);
  } catch (error) {
    console.error('POST /api/reactions error:', error);
    return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500 });
  }
}
