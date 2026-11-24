import Link from 'next/link';
import { getEntryStore } from '@/lib/entries/store';
import { categoryEmoji } from '@/lib/entries/labels';
import { categoryColor } from './categoryColors';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const store = await getEntryStore();
  const [categories, counts] = await Promise.all([
    store.listCategories(),
    store.liveCountsByCategory(),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-10">
        <div className="evidence-tag inline-block mb-4">Life Areas</div>
        <h1 className="font-display text-3xl sm:text-4xl text-ink leading-tight mb-3">
          Browse by Category
        </h1>
        <p className="text-ink/50 max-w-xl">
          Inherited defaults sorted by the part of life they shape. The same worries show up
          in every culture, just dressed differently.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {categories.map((category) => {
          const count = counts[category.slug] ?? 0;
          return (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="relative overflow-hidden rounded-xl p-6 text-left transition-all hover-lift ring-1 ring-ink/10 block"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${categoryColor(category.slug)}`}
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{categoryEmoji(category.slug)}</span>
                  <span className="text-xs font-mono px-2 py-1 rounded-full bg-ink/10 text-ink/50">
                    {count} entr{count !== 1 ? 'ies' : 'y'}
                  </span>
                </div>
                <h3 className="font-display text-lg text-ink mb-1">{category.label}</h3>
                <p className="text-sm text-ink/50 leading-relaxed line-clamp-2">
                  {category.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-ink/40 font-medium">No categories yet.</p>
        </div>
      )}
    </div>
  );
}
