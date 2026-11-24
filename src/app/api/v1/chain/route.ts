import { apiError, apiJson, apiPreflight } from '@/lib/api/v1';
import { getChainStore } from '@/lib/chain/store';

export async function GET() {
  try {
    return apiJson({ data: await (await getChainStore()).publicTallies() });
  } catch (error) {
    console.error('GET /api/v1/chain error:', error);
    return apiError(500, 'serverError', 'Failed to load Broken Chain tallies.');
  }
}

export const OPTIONS = apiPreflight;
