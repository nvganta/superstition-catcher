import { NextRequest, NextResponse } from 'next/server';
import { getEntryStore } from '@/lib/entries/store';

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('q') ?? '';
    const store = await getEntryStore();
    const results = await store.search(query);
    return NextResponse.json(
      results.map(({ id, title, country, countryFlag, origin }) => ({ id, title, country, countryFlag, origin }))
    );
  } catch (error) {
    console.error('GET /api/entries error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
