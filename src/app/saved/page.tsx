import Link from 'next/link';
import { getEntryStore } from '@/lib/entries/store';
import { categoryLabelMap } from '@/lib/entries/labels';
import { getReactionStore } from '@/lib/reactions/store';
import { currentVisitorId } from '@/lib/visitorSession';
import EntryCard from '@/components/EntryCard';
import UnhideButton from '@/components/UnhideButton';

export const dynamic = 'force-dynamic';

export default async function SavedPage() {
  const [entryStore, reactionStore, visitorId] = await Promise.all([
    getEntryStore(),
    getReactionStore(),
    currentVisitorId(),
  ]);
  const [{ saved, hidden }, categories] = await Promise.all([
    reactionStore.listForVisitor(visitorId),
    entryStore.listCategories(),
  ]);
  const categoryLabels = categoryLabelMap(categories);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-10">
        <div className="evidence-tag inline-block mb-4">Your Shelf</div>
        <h1 className="font-display text-3xl sm:text-4xl text-ink leading-tight mb-3">Saved entries</h1>
        <p className="text-ink/50 max-w-xl">
          The traditions you wanted to come back to. This list lives with this browser, so it is yours
          without an account.
        </p>
      </div>

      {saved.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {saved.map((entry) => (
            <EntryCard key={entry.id} entry={entry} categoryLabels={categoryLabels} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🔖</div>
          <p className="text-ink/40 font-medium mb-4">Nothing saved yet.</p>
          <Link href="/" className="text-sm font-semibold text-coral hover:underline">
            Find one worth keeping →
          </Link>
        </div>
      )}

      {hidden.length > 0 && (
        <section className="mt-16">
          <hr className="case-divider mb-8" />
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl">🙈</span>
            <h2 className="font-display text-lg text-ink tracking-tight">HIDDEN FROM YOUR FEEDS</h2>
            <div className="flex-grow h-px bg-ink/10" />
          </div>
          <p className="text-sm text-ink/40 mb-5">These stay out of home, explore and category pages for you.</p>
          <ul className="space-y-2">
            {hidden.map((entry) => (
              <li key={entry.id} className="paper-card rounded-lg p-4 flex items-center justify-between gap-4">
                <Link href={`/superstition/${entry.id}`} className="flex items-center gap-3 min-w-0 group">
                  <span className="text-lg shrink-0">{entry.countryFlag}</span>
                  <span className="font-semibold text-sm text-ink truncate group-hover:text-coral">{entry.title}</span>
                </Link>
                <UnhideButton entryId={entry.id} title={entry.title} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
