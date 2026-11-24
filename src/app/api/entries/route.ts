import { NextRequest, NextResponse } from 'next/server';
import { getEntryStore } from '@/lib/entries/store';
import { badJsonResponse, writeResultResponse } from '@/lib/entries/http';

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

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badJsonResponse();
  }

  try {
    const store = await getEntryStore();
    return writeResultResponse(await store.postCommunity(body));
  } catch (error) {
    console.error('POST /api/entries error:', error);
    return NextResponse.json({ error: 'Failed to post entry' }, { status: 500 });
  }
}
