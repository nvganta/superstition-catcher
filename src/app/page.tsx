import { getEntryStore } from '@/lib/entries/store';
import { categoryLabelMap } from '@/lib/entries/labels';
import EntryCard from '@/components/EntryCard';
import EntryFeed from '@/components/EntryFeed';
import SearchBar from '@/components/SearchBar';
import { getReactionStore } from '@/lib/reactions/store';
import { currentVisitorId } from '@/lib/visitorSession';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [store, reactions, visitorId] = await Promise.all([getEntryStore(), getReactionStore(), currentVisitorId()]);
  const hidden = await reactions.hiddenEntryIds(visitorId);
  const [entries, entryOfTheDay, categories] = await Promise.all([
    store.listLive({ excludeIds: hidden }),
    store.entryOfTheDay(),
    store.listCategories(),
  ]);
  const categoryLabels = categoryLabelMap(categories);
  const daily = entryOfTheDay && !hidden.includes(entryOfTheDay.id) ? entryOfTheDay : null;
  const feed = daily ? entries.filter((entry) => entry.id !== daily.id) : entries;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <section className="pt-12 pb-10 sm:pt-16 sm:pb-14">
        <div className="max-w-3xl">
          <div className="evidence-tag inline-block mb-4">A Living Record</div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink leading-[1.1] mb-5">
            Every tradition
            <br />
            has a{' '}
            <span className="text-coral relative inline-block">
              story
              <svg
                className="absolute -bottom-1 left-0 w-full"
                height="8"
                viewBox="0 0 200 8"
                fill="none"
              >
                <path
                  d="M1 5.5C40 2 60 7 100 4C140 1 160 6 199 3"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            .
          </h1>
          <p className="text-lg text-ink/60 leading-relaxed mb-8 max-w-xl">
            The defaults we inherit, from the lemon over the shop door to the number we skip
            in lifts. Where they started, why they stuck, and what&apos;s changed since.
          </p>
          <SearchBar />
        </div>
      </section>

      <hr className="case-divider mb-10" />

      {daily && (
        <>
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xl">📋</span>
              <h2 className="font-display text-lg text-ink tracking-tight">ENTRY OF THE DAY</h2>
              <div className="flex-grow h-px bg-ink/10" />
            </div>
            <EntryCard entry={daily} categoryLabels={categoryLabels} featured />
          </section>

          <hr className="case-divider mb-10" />
        </>
      )}

      <section className="pb-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xl">🗂️</span>
          <h2 className="font-display text-lg text-ink tracking-tight">ALL ENTRIES</h2>
          <div className="flex-grow h-px bg-ink/10" />
        </div>
        <EntryFeed entries={feed} categoryLabels={categoryLabels} />
      </section>
    </div>
  );
}
