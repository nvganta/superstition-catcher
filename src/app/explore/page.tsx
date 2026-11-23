import { getEntryStore } from '@/lib/entries/store';
import { categoryLabelMap } from '@/lib/entries/labels';
import RegionExplorer from '@/components/RegionExplorer';

export const dynamic = 'force-dynamic';

export default async function ExplorePage() {
  const store = await getEntryStore();
  const [entries, categories] = await Promise.all([store.listLive(), store.listCategories()]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-10">
        <div className="evidence-tag inline-block mb-4">World Map</div>
        <h1 className="font-display text-3xl sm:text-4xl text-ink leading-tight mb-3">
          Explore by Region
        </h1>
        <p className="text-ink/50 max-w-xl">
          Every culture hands down its own defaults. Pick a region to see what people there
          grew up being told.
        </p>
      </div>

      <RegionExplorer entries={entries} categoryLabels={categoryLabelMap(categories)} />
    </div>
  );
}
