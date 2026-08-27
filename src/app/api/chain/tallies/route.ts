import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { emptyTally, isStance, type StanceTally } from '@/data/brokenChain';

// GET — stance tallies for every superstition at once, keyed by superstitionId.
// One aggregation for the whole Broken Chains board rather than 42 round trips.
export async function GET() {
  try {
    const db = await getDb();
    const rows = await db
      .collection('chainEntries')
      .aggregate([
        {
          $group: {
            _id: { superstitionId: '$superstitionId', stance: '$stance' },
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const tallies: Record<string, StanceTally> = {};
    for (const row of rows) {
      const { superstitionId, stance } = row._id;
      if (typeof superstitionId !== 'string' || !isStance(stance)) continue;
      if (!tallies[superstitionId]) tallies[superstitionId] = { ...emptyTally };
      tallies[superstitionId][stance] = row.count;
    }

    return NextResponse.json({ tallies });
  } catch (error) {
    console.error('GET /api/chain/tallies error:', error);
    return NextResponse.json({ error: 'Failed to fetch tallies' }, { status: 500 });
  }
}
