'use client';

import Link from 'next/link';
import { Superstition, categoryLabels } from '@/data/superstitions';
import VerdictBadge from './VerdictBadge';

export default function SuperstitionCard({
  superstition,
  featured = false,
}: {
  superstition: Superstition;
  featured?: boolean;
}) {
  const s = superstition;

  if (featured) {
    return (
      <Link href={`/superstition/${s.id}`} className="block group">
        <div className="paper-card rounded-xl p-8 hover-lift relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-coral via-amber to-teal" />

          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="evidence-tag">Case File</span>
              <span className="text-sm text-ink/50 font-mono">
                #{s.id.slice(0, 8).toUpperCase()}
              </span>
            </div>
            <VerdictBadge verdict={s.verdict} />
          </div>

          <h3 className="font-display text-2xl md:text-3xl text-ink leading-tight mb-4 group-hover:text-coral transition-colors">
            {s.title}
          </h3>

          <p className="text-ink/70 leading-relaxed mb-5 line-clamp-2">
            {s.whatPeopleBelieve}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">{s.countryFlag}</span>
              <span className="text-sm font-medium text-ink/60">{s.country}</span>
              <span className="text-ink/20">•</span>
              <span className="text-sm text-ink/50">{categoryLabels[s.category]}</span>
            </div>
            <span className="text-sm font-semibold text-coral group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
              Investigate →
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/superstition/${s.id}`} className="block group">
      <div className="paper-card rounded-lg p-5 hover-lift h-full flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber to-coral opacity-60" />

        <div className="flex items-center justify-between mb-3">
          <span className="text-lg">{s.countryFlag}</span>
          <VerdictBadge verdict={s.verdict} />
        </div>

        <h3 className="font-display text-base text-ink leading-snug mb-2 group-hover:text-coral transition-colors flex-grow">
          {s.title}
        </h3>

        <p className="text-sm text-ink/60 line-clamp-2 mb-3">
          {s.whatPeopleBelieve}
        </p>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-ink/5">
          <span className="text-xs text-ink/40 font-medium">
            {categoryLabels[s.category]}
          </span>
          <span className="text-xs font-semibold text-coral opacity-0 group-hover:opacity-100 transition-opacity">
            Read more →
          </span>
        </div>
      </div>
    </Link>
  );
}
