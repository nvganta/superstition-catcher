import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getEntryStore } from '@/lib/entries/store';
import { categoryEmoji, categoryLabelMap } from '@/lib/entries/labels';
import EntryCard from '@/components/EntryCard';

export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await getEntryStore();
  const [categories, entries] = await Promise.all([
    store.listCategories(),
    store.listLive({ categorySlug: slug }),
  ]);
  const category = categories.find((candidate) => candidate.slug === slug);
  if (!category) {
    notFound();
  }
  const categoryLabels = categoryLabelMap(categories);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex items-center gap-2 text-sm text-ink/40 mb-8">
        <Link href="/categories" className="hover:text-ink transition-colors">
          Categories
        </Link>
        <span>/</span>
        <span className="text-ink/60 truncate">{category.label}</span>
      </div>

      <div className="mb-10">
        <div className="evidence-tag inline-block mb-4">Life Area</div>
        <h1 className="font-display text-3xl sm:text-4xl text-ink leading-tight mb-3">
          <span className="mr-3">{categoryEmoji(category.slug)}</span>
          {category.label}
        </h1>
        <p className="text-ink/50 max-w-xl">{category.description}</p>
      </div>

      <hr className="case-divider mb-8" />
      <div className="flex items-center gap-3 mb-6">
        <h2 className="font-display text-lg text-ink tracking-tight">
          {category.label.toUpperCase()} ENTRIES
        </h2>
        <div className="flex-grow h-px bg-ink/10" />
        <span className="text-sm text-ink/40 font-mono">{entries.length} found</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {entries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} categoryLabels={categoryLabels} />
        ))}
      </div>

      {entries.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-ink/40 font-medium mb-4">Nothing here yet.</p>
          <Link href="/post" className="text-sm font-semibold text-coral hover:underline">
            Be the first to add one →
          </Link>
        </div>
      )}
    </div>
  );
}
