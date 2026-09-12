import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { isAdminPassword } from '@/lib/admin-auth';

function toObjectId(id: string): ObjectId | null {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

// PATCH — admin: approve an entry so its story becomes visible.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminPassword = request.headers.get('x-admin-password');
    if (!isAdminPassword(adminPassword)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const _id = toObjectId(id);
    if (!_id) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db
      .collection('chainEntries')
      .updateOne({ _id }, { $set: { approved: true, approvedAt: new Date().toISOString() } });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /api/chain/[id] error:', error);
    return NextResponse.json({ error: 'Failed to approve entry' }, { status: 500 });
  }
}

// DELETE — admin: reject an entry outright.
//
// This removes the stance from the tally too, which is correct: a rejected
// entry should not quietly keep voting.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const adminPassword = request.headers.get('x-admin-password');
    if (!isAdminPassword(adminPassword)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const _id = toObjectId(id);
    if (!_id) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection('chainEntries').deleteOne({ _id });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/chain/[id] error:', error);
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}
