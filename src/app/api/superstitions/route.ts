import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// GET all superstitions
export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const filter: Record<string, unknown> = {};
    if (region) filter.region = region;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
        { whatPeopleBelieve: { $regex: search, $options: 'i' } },
        { historicalOrigin: { $regex: search, $options: 'i' } },
        { theRealReason: { $regex: search, $options: 'i' } },
      ];
    }

    const superstitions = await db
      .collection('superstitions')
      .find(filter)
      .sort({ _id: -1 })
      .toArray();

    return NextResponse.json(superstitions);
  } catch (error) {
    console.error('GET /api/superstitions error:', error);
    return NextResponse.json({ error: 'Failed to fetch superstitions' }, { status: 500 });
  }
}

// POST new superstition (admin only)
export async function POST(request: NextRequest) {
  try {
    const adminPassword = request.headers.get('x-admin-password');
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const body = await request.json();

    // Generate an id from the title if not provided
    if (!body.id) {
      body.id = body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }

    body.createdAt = new Date();
    body.updatedAt = new Date();

    await db.collection('superstitions').insertOne(body);

    return NextResponse.json({ success: true, id: body.id }, { status: 201 });
  } catch (error) {
    console.error('POST /api/superstitions error:', error);
    return NextResponse.json({ error: 'Failed to create superstition' }, { status: 500 });
  }
}
