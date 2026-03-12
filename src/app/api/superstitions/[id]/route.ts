import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

// GET single superstition by id
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDb();
    const superstition = await db.collection('superstitions').findOne({ id });

    if (!superstition) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(superstition);
  } catch (error) {
    console.error('GET /api/superstitions/[id] error:', error);
    return NextResponse.json({ error: 'Failed to fetch superstition' }, { status: 500 });
  }
}

// PUT update superstition (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminPassword = request.headers.get('x-admin-password');
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = await getDb();
    const body = await request.json();
    body.updatedAt = new Date();

    const result = await db
      .collection('superstitions')
      .updateOne({ id }, { $set: body });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/superstitions/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update superstition' }, { status: 500 });
  }
}

// DELETE superstition (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminPassword = request.headers.get('x-admin-password');
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const db = await getDb();
    const result = await db.collection('superstitions').deleteOne({ id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/superstitions/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete superstition' }, { status: 500 });
  }
}
