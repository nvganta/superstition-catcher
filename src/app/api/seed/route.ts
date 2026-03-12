import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { superstitions } from '@/data/superstitions';

// POST seed database with static data
export async function POST(request: NextRequest) {
  try {
    const adminPassword = request.headers.get('x-admin-password');
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    const db = await getDb();
    const collection = db.collection('superstitions');

    // Check if already seeded
    const existing = await collection.countDocuments();
    if (existing > 0 && !force) {
      return NextResponse.json({
        message: `Database already has ${existing} superstitions. Use ?force=true to reseed.`,
        count: existing,
      });
    }

    if (force) {
      await collection.deleteMany({});
    }

    const docs = superstitions.map((s) => ({
      ...s,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await collection.insertMany(docs);

    // Create indexes
    await collection.createIndex({ id: 1 }, { unique: true });
    await collection.createIndex({ region: 1 });
    await collection.createIndex({ category: 1 });
    await collection.createIndex({ title: 'text', whatPeopleBelieve: 'text', theRealReason: 'text' });

    // Also create indexes for reactions and comments
    await db.collection('reactions').createIndex({ superstitionId: 1 });
    await db.collection('reactions').createIndex({ superstitionId: 1, visitorId: 1 });
    await db.collection('comments').createIndex({ superstitionId: 1 });

    return NextResponse.json({
      success: true,
      message: `Seeded ${docs.length} superstitions`,
      count: docs.length,
    });
  } catch (error) {
    console.error('POST /api/seed error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
