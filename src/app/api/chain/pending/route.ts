import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { isAdminPassword } from '@/lib/admin-auth';

// GET — admin: the moderation queue for Broken Chain entries.
export async function GET(request: NextRequest) {
  try {
    const adminPassword = request.headers.get('x-admin-password');
    if (!isAdminPassword(adminPassword)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const pending = await db
      .collection('chainEntries')
      .find({ approved: false })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json(pending);
  } catch (error) {
    console.error('GET /api/chain/pending error:', error);
    return NextResponse.json({ error: 'Failed to fetch pending entries' }, { status: 500 });
  }
}
