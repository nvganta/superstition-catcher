import { NextRequest } from 'next/server';
import { apiError, apiInvalidQuery, apiJson, apiPreflight, parseEntryListQuery, toApiEntry } from '@/lib/api/v1';
import { getEntryStore } from '@/lib/entries/store';

export async function GET(request: NextRequest) {
  const parsed = parseEntryListQuery(request.nextUrl.searchParams);
  if (!parsed.success) {
    return apiInvalidQuery(parsed.error);
  }
  const { region, category, origin, page, limit } = parsed.data;

  try {
    const store = await getEntryStore();
    const result = await store.pageLive({ region, categorySlug: category, origin }, { offset: (page - 1) * limit, limit });
    return apiJson({
      data: result.entries.map((entry) => toApiEntry(entry, request.nextUrl.origin)),
      pagination: { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) },
    });
  } catch (error) {
    console.error('GET /api/v1/entries error:', error);
    return apiError(500, 'serverError', 'Failed to list entries.');
  }
}

export const OPTIONS = apiPreflight;
