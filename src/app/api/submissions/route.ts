import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// POST — submit a new myth suggestion
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, country, myth } = body;

    if (!myth || typeof myth !== 'string' || myth.trim().length === 0) {
      return NextResponse.json(
        { error: 'Myth description is required' },
        { status: 400 }
      );
    }

    if (myth.length > 1000) {
      return NextResponse.json(
        { error: 'Myth must be under 1000 characters' },
        { status: 400 }
      );
    }

    const db = await getDb();
    await db.collection('submissions').insertOne({
      name: (name || 'Anonymous').slice(0, 50),
      country: (country || '').slice(0, 50),
      myth: myth.trim().slice(0, 1000),
      status: 'pending',
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/submissions error:', error);
    return NextResponse.json(
      { error: 'Failed to submit' },
      { status: 500 }
    );
  }
}

// GET — admin: list all submissions
export async function GET(request: NextRequest) {
  try {
    const adminPassword = request.headers.get('x-admin-password');
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const submissions = await db
      .collection('submissions')
      .find()
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('GET /api/submissions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
