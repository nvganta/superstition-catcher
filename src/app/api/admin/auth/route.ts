import { NextRequest, NextResponse } from 'next/server';
import { isAdminPassword } from '@/lib/admin-auth';

// POST verify admin password
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (isAdminPassword(password)) {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 });
  }
}
