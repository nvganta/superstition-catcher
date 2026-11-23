import { NextRequest, NextResponse } from 'next/server';
import { isAdminPassword } from '@/lib/admin-auth';
import { loadEditorialDashboard } from '@/lib/editorial/dashboard';
import { getDb } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  if (!isAdminPassword(request.headers.get('x-admin-password'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    return NextResponse.json(await loadEditorialDashboard(await getDb()));
  } catch (error) {
    console.error('GET /api/admin/dashboard error:', error);
    return NextResponse.json({ error: 'Failed to load the dashboard' }, { status: 500 });
  }
}
