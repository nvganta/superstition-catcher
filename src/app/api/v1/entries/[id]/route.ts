import { NextRequest } from 'next/server';
import { apiError, apiJson, apiPreflight, toApiEntry } from '@/lib/api/v1';
import { getChainStore } from '@/lib/chain/store';
import { getEntryStore } from '@/lib/entries/store';

type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const entry = await (await getEntryStore()).getLive(id);
    if (!entry) {
      return apiError(404, 'notFound', 'No live entry has that id.');
    }
    const chain = await (await getChainStore()).tallyFor(entry.id);
    return apiJson({ data: { ...toApiEntry(entry, request.nextUrl.origin), chain } });
  } catch (error) {
    console.error('GET /api/v1/entries/[id] error:', error);
    return apiError(500, 'serverError', 'Failed to load the entry.');
  }
}

export const OPTIONS = apiPreflight;
