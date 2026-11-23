import { apiError, apiJson, apiPreflight, toApiCategory } from '@/lib/api/v1';
import { getEntryStore } from '@/lib/entries/store';

export async function GET() {
  try {
    const store = await getEntryStore();
    const [categories, counts] = await Promise.all([store.listCategories(), store.liveCountsByCategory()]);
    return apiJson({
      data: categories.map((category) => ({ ...toApiCategory(category), entryCount: counts[category.slug] ?? 0 })),
    });
  } catch (error) {
    console.error('GET /api/v1/categories error:', error);
    return apiError(500, 'serverError', 'Failed to list categories.');
  }
}

export const OPTIONS = apiPreflight;
