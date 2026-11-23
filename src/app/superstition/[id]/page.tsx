import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { PublicEntry } from '@/lib/entries/documents';
import { getEntryStore } from '@/lib/entries/store';
import { categoryLabelMap, confidenceLabels, sourceKindLabels } from '@/lib/entries/labels';
import OriginBadge from '@/components/OriginBadge';
import EntryCard from '@/components/EntryCard';
import Reactions from '@/components/Reactions';
import Comments from '@/components/Comments';

export const dynamic = 'force-dynamic';

const NARRATIVE_SECTIONS = [
  { field: 'theDefault', title: 'THE DEFAULT', icon: '🗣️', bar: 'bg-amber', dot: 'bg-amber/15' },
  { field: 'whyItStarted', title: 'WHY IT STARTED', icon: '📜', bar: 'bg-slate-blue', dot: 'bg-slate-blue/15' },
  { field: 'whyItStuck', title: 'WHY IT STUCK', icon: '🔁', bar: 'bg-teal', dot: 'bg-teal/15' },
  { field: 'whatsChangedSince', title: "WHAT'S CHANGED SINCE", icon: '📱', bar: 'bg-coral', dot: 'bg-coral/15' },
  { field: 'freshLook', title: 'A FRESH LOOK', icon: '💭', bar: 'bg-lavender', dot: 'bg-lavender/25' },
] as const satisfies ReadonlyArray<{ field: keyof PublicEntry; [key: string]: string }>;

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function postedLine(entry: PublicEntry): string {
  return entry.origin === 'curated'
    ? `Curated by the editors · updated ${formatDate(entry.updatedAt)}`
    : `Posted by ${entry.postedBy ?? 'a visitor'} · ${formatDate(entry.createdAt)}`;
}

export default async function EntryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = await getEntryStore();
  const entry = await store.getLive(id);
  if (!entry) {
    notFound();
  }
  const [related, categories] = await Promise.all([store.listRelated(entry), store.listCategories()]);
  const categoryLabels = categoryLabelMap(categories);
  const confidence = entry.confidence ? confidenceLabels[entry.confidence] : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex items-center gap-2 text-sm text-ink/40 mb-8">
        <Link href="/" className="hover:text-ink transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/explore" className="hover:text-ink transition-colors">
          {entry.country}
        </Link>
        <span>/</span>
        <span className="text-ink/60 truncate">{entry.title}</span>
      </div>

      <div className="paper-card rounded-xl p-6 sm:p-10 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-coral via-amber to-teal" />

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="evidence-tag">Entry</span>
          <span className="text-xs font-mono text-ink/30">
            #{entry.id.toUpperCase().replace(/-/g, '')}
          </span>
          <OriginBadge origin={entry.origin} />
        </div>

        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-ink leading-tight mb-4">
          {entry.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-2xl">{entry.countryFlag}</span>
          <span className="text-ink/60 font-medium">{entry.country}</span>
          <span className="text-ink/20">•</span>
          {entry.categorySlugs.map((slug) => (
            <Link
              key={slug}
              href={`/categories/${slug}`}
              className="text-xs font-semibold px-2.5 py-1 rounded-full bg-ink/5 text-ink/60 hover:bg-ink/10 hover:text-ink transition-colors"
            >
              {categoryLabels[slug] ?? slug}
            </Link>
          ))}
        </div>

        <p className="text-xs text-ink/40">{postedLine(entry)}</p>
      </div>

      <div className="space-y-6">
        {NARRATIVE_SECTIONS.map((section) => {
          const text = entry[section.field];
          if (!text) return null;
          return (
            <section key={section.field} className="paper-card rounded-xl p-6 sm:p-8 relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1.5 h-full ${section.bar}`} />
              <div className="flex items-center gap-3 mb-4">
                <span className={`w-8 h-8 rounded-full ${section.dot} flex items-center justify-center text-sm`}>
                  {section.icon}
                </span>
                <h2 className="font-display text-base tracking-tight text-ink">{section.title}</h2>
              </div>
              <p className="text-ink/70 leading-relaxed text-base sm:text-lg pl-11 whitespace-pre-line">{text}</p>
            </section>
          );
        })}

        <section className="paper-card rounded-xl p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-coral via-amber to-teal" />
          <h2 className="font-display text-sm tracking-widest text-ink/40 mb-4">HOW SURE ARE WE?</h2>
          {confidence ? (
            <>
              <div className="flex justify-center mb-4">
                <div className="stamp text-stamp-blue bg-stamp-blue/10 border-stamp-blue text-lg px-5 py-2">
                  {confidence.label}
                </div>
              </div>
              <p className="text-ink/50 text-sm max-w-md mx-auto">{confidence.description}</p>
            </>
          ) : (
            <p className="text-ink/50 text-sm max-w-md mx-auto">
              A community entry, shared as the poster knows it. The editors have not reviewed it yet.
            </p>
          )}
          {entry.uncertaintyNote && (
            <p className="text-ink/60 text-sm max-w-md mx-auto mt-4 italic">{entry.uncertaintyNote}</p>
          )}
        </section>

        <section className="paper-card rounded-xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center text-sm">📚</span>
            <h2 className="font-display text-base tracking-tight text-ink">SOURCES</h2>
          </div>
          {entry.sources.length > 0 ? (
            <ul className="space-y-2 pl-11">
              {entry.sources.map((source) => (
                <li key={`${source.title}-${source.url ?? ''}`} className="text-ink/70">
                  <span className="text-xs font-mono uppercase text-ink/40 mr-2">
                    {sourceKindLabels[source.kind]}
                  </span>
                  {source.url ? (
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="underline decoration-amber underline-offset-2 hover:text-ink"
                    >
                      {source.title}
                    </a>
                  ) : (
                    source.title
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink/50 text-sm pl-11">
              {entry.legacy
                ? 'Carried over from the original Superstition Buster collection. Sources have not been attached yet.'
                : 'No sources listed yet.'}
            </p>
          )}
        </section>

        {entry.legacy?.funFact && (
          <section className="bg-evidence-yellow/20 border-2 border-evidence-yellow/40 rounded-xl p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">💡</span>
              <div>
                <h2 className="font-display text-sm tracking-tight text-ink mb-2">FUN FACT</h2>
                <p className="text-ink/70 leading-relaxed">{entry.legacy.funFact}</p>
              </div>
            </div>
          </section>
        )}
      </div>

      <section className="mt-10">
        <hr className="case-divider mb-8" />
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xl">⚡</span>
          <h2 className="font-display text-base tracking-tight text-ink">YOUR TAKE</h2>
          <div className="flex-grow h-px bg-ink/10" />
        </div>
        <Reactions superstitionId={entry.id} />
      </section>

      <section className="mt-10">
        <hr className="case-divider mb-8" />
        <Comments superstitionId={entry.id} />
      </section>

      {related.length > 0 && (
        <section className="mt-16">
          <hr className="case-divider mb-10" />
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xl">🔗</span>
            <h2 className="font-display text-lg text-ink tracking-tight">RELATED ENTRIES</h2>
            <div className="flex-grow h-px bg-ink/10" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {related.map((other) => (
              <EntryCard key={other.id} entry={other} categoryLabels={categoryLabels} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-12 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-ink/40 hover:text-ink transition-colors"
        >
          ← Back to all entries
        </Link>
      </div>
    </div>
  );
}
