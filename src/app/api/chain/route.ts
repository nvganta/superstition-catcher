import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { emptyTally, isStance, limits, type StanceTally } from '@/data/brokenChain';

// GET — approved stories for one superstition, plus the stance tally.
//
// The tally counts every entry, approved or not; the story list only shows
// approved ones. The stance is a four-value enum and can't be abused, so the
// bar moves the moment someone answers. The prose is what needs a human.
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const superstitionId = searchParams.get('superstitionId');

    if (!superstitionId) {
      return NextResponse.json({ error: 'superstitionId required' }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('chainEntries');

    const [entries, counts] = await Promise.all([
      collection
        .find({ superstitionId, approved: true })
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray(),
      collection
        .aggregate([
          { $match: { superstitionId } },
          { $group: { _id: '$stance', count: { $sum: 1 } } },
        ])
        .toArray(),
    ]);

    const tally: StanceTally = { ...emptyTally };
    for (const row of counts) {
      if (isStance(row._id)) tally[row._id] = row.count;
    }

    return NextResponse.json({ entries, tally });
  } catch (error) {
    console.error('GET /api/chain error:', error);
    return NextResponse.json({ error: 'Failed to fetch chain entries' }, { status: 500 });
  }
}

// POST — add or replace this visitor's entry for this superstition.
//
// Upsert rather than insert: one person, one voice per superstition, otherwise
// the tally counts posts instead of people and a single loud visitor bends the
// bar. Changing your mind later overwrites your old entry, which is exactly
// what a record of shifting traditions should allow.
export async function POST(request: NextRequest) {
  try {
    const { superstitionId, visitorId, stance, name, whoDidIt, whatChanged } =
      await request.json();

    if (!superstitionId || !visitorId) {
      return NextResponse.json(
        { error: 'superstitionId and visitorId required' },
        { status: 400 }
      );
    }

    if (!isStance(stance)) {
      return NextResponse.json({ error: 'A valid stance is required' }, { status: 400 });
    }

    if (!whatChanged || typeof whatChanged !== 'string' || !whatChanged.trim()) {
      return NextResponse.json({ error: 'Tell us what happened' }, { status: 400 });
    }

    const db = await getDb();
    await db.collection('chainEntries').updateOne(
      { superstitionId, visitorId },
      {
        $set: {
          stance,
          name: (typeof name === 'string' && name.trim() ? name.trim() : 'Anonymous').slice(
            0,
            limits.name
          ),
          whoDidIt:
            typeof whoDidIt === 'string' ? whoDidIt.trim().slice(0, limits.whoDidIt) : '',
          whatChanged: whatChanged.trim().slice(0, limits.whatChanged),
          approved: false,
          createdAt: new Date().toISOString(),
        },
        $setOnInsert: { superstitionId, visitorId },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, pending: true });
  } catch (error) {
    console.error('POST /api/chain error:', error);
    return NextResponse.json({ error: 'Failed to save entry' }, { status: 500 });
  }
}
