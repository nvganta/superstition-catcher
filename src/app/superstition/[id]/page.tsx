'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getSuperstitionById, categoryLabels, superstitions } from '@/data/superstitions';
import VerdictBadge from '@/components/VerdictBadge';
import SuperstitionCard from '@/components/SuperstitionCard';

export default function SuperstitionDetailPage() {
  const params = useParams();
  const s = getSuperstitionById(params.id as string);

  if (!s) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="text-6xl mb-4">🕵️</div>
        <h1 className="font-display text-2xl text-ink mb-2">Case Not Found</h1>
        <p className="text-ink/50 mb-6">
          This superstition seems to have vanished into thin air.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-cream rounded-lg font-medium text-sm hover:bg-navy transition-colors"
        >
          ← Back to HQ
        </Link>
      </div>
    );
  }

  // Get related superstitions (same category or region, excluding current)
  const related = superstitions
    .filter(
      (other) =>
        other.id !== s.id &&
        (other.category === s.category || other.region === s.region)
    )
    .slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-ink/40 mb-8">
        <Link href="/" className="hover:text-ink transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link href="/explore" className="hover:text-ink transition-colors">
          {s.country}
        </Link>
        <span>/</span>
        <span className="text-ink/60 truncate">{s.title}</span>
      </div>

      {/* Case File Header */}
      <div className="paper-card rounded-xl p-6 sm:p-10 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-coral via-amber to-teal" />

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="evidence-tag">Case File</span>
          <span className="text-xs font-mono text-ink/30">
            #{s.id.toUpperCase().replace(/-/g, '')}
          </span>
          <span className="text-xs text-ink/20">|</span>
          <span className="text-sm text-ink/50">{categoryLabels[s.category]}</span>
        </div>

        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-ink leading-tight mb-4">
          {s.title}
        </h1>

        <div className="flex items-center gap-3">
          <span className="text-2xl">{s.countryFlag}</span>
          <span className="text-ink/60 font-medium">{s.country}</span>
        </div>
      </div>

      {/* Investigation Sections */}
      <div className="space-y-6">
        {/* What People Believe */}
        <section className="paper-card rounded-xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-amber" />
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-full bg-amber/15 flex items-center justify-center text-sm">
              🗣️
            </span>
            <h2 className="font-display text-base tracking-tight text-ink">
              WHAT PEOPLE BELIEVE
            </h2>
          </div>
          <p className="text-ink/70 leading-relaxed text-base sm:text-lg pl-11">
            {s.whatPeopleBelieve}
          </p>
        </section>

        {/* Historical Origin */}
        <section className="paper-card rounded-xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-blue" />
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-full bg-slate-blue/15 flex items-center justify-center text-sm">
              📜
            </span>
            <h2 className="font-display text-base tracking-tight text-ink">
              HISTORICAL ORIGIN
            </h2>
          </div>
          <p className="text-ink/70 leading-relaxed text-base sm:text-lg pl-11">
            {s.historicalOrigin}
          </p>
        </section>

        {/* The Real Reason */}
        <section className="paper-card rounded-xl p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-teal" />
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-full bg-teal/15 flex items-center justify-center text-sm">
              🔬
            </span>
            <h2 className="font-display text-base tracking-tight text-ink">
              THE REAL REASON
            </h2>
          </div>
          <p className="text-ink/70 leading-relaxed text-base sm:text-lg pl-11">
            {s.theRealReason}
          </p>
        </section>

        {/* Verdict */}
        <section className="paper-card rounded-xl p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-coral via-amber to-teal" />
          <h2 className="font-display text-sm tracking-widest text-ink/40 mb-4">
            VERDICT
          </h2>
          <div className="flex justify-center mb-4">
            <VerdictBadge verdict={s.verdict} size="lg" />
          </div>
          {s.verdict === 'busted' && (
            <p className="text-ink/50 text-sm max-w-md mx-auto">
              This one doesn&apos;t hold up to scrutiny. Pure myth, no substance.
            </p>
          )}
          {s.verdict === 'hasMerit' && (
            <p className="text-ink/50 text-sm max-w-md mx-auto">
              There&apos;s a kernel of truth here, even if the original reasoning was off.
            </p>
          )}
          {s.verdict === 'practicalOrigin' && (
            <p className="text-ink/50 text-sm max-w-md mx-auto">
              This started as genuinely practical advice that evolved into superstition over time.
            </p>
          )}
        </section>

        {/* Fun Fact */}
        {s.funFact && (
          <section className="bg-evidence-yellow/20 border-2 border-evidence-yellow/40 rounded-xl p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">💡</span>
              <div>
                <h2 className="font-display text-sm tracking-tight text-ink mb-2">
                  FUN FACT
                </h2>
                <p className="text-ink/70 leading-relaxed">{s.funFact}</p>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Related Cases */}
      {related.length > 0 && (
        <section className="mt-16">
          <hr className="case-divider mb-10" />
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xl">🔗</span>
            <h2 className="font-display text-lg text-ink tracking-tight">
              RELATED CASES
            </h2>
            <div className="flex-grow h-px bg-ink/10" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {related.map((r) => (
              <SuperstitionCard key={r.id} superstition={r} />
            ))}
          </div>
        </section>
      )}

      {/* Back Link */}
      <div className="mt-12 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-ink/40 hover:text-ink transition-colors"
        >
          ← Back to all cases
        </Link>
      </div>
    </div>
  );
}
