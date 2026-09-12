'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { superstitions, categoryLabels } from '@/data/superstitions';
import {
  emptyTally,
  stanceColors,
  stanceLabels,
  stances,
  tallyPercent,
  tallyTotal,
  type StanceTally,
} from '@/data/brokenChain';

type SortMode = 'fading' | 'mutating' | 'holding' | 'most';

const sortLabels: Record<SortMode, string> = {
  fading: 'Fading fastest',
  mutating: 'Changing shape',
  holding: 'Holding on',
  most: 'Most answered',
};

export default function ChainsPage() {
  const [tallies, setTallies] = useState<Record<string, StanceTally>>({});
  const [sort, setSort] = useState<SortMode>('mutating');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/chain/tallies')
      .then((res) => (res.ok ? res.json() : { tallies: {} }))
      .then((data) => setTallies(data.tallies || {}))
      .catch((err) => console.error('Failed to fetch tallies:', err))
      .finally(() => setLoading(false));
  }, []);

  // Only superstitions anyone has actually answered for. An empty bar tells
  // you nothing and a board full of them tells you less.
  const answered = superstitions
    .map((s) => ({ s, tally: tallies[s.id] || emptyTally }))
    .filter(({ tally }) => tallyTotal(tally) > 0);

  const sorted = [...answered].sort((a, b) => {
    if (sort === 'most') return tallyTotal(b.tally) - tallyTotal(a.tally);
    const key = sort === 'fading' ? 'stoppedIt' : sort === 'mutating' ? 'changedIt' : 'stillDoIt';
    return tallyPercent(b.tally, key) - tallyPercent(a.tally, key);
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">⛓️</span>
          <h1 className="font-display text-3xl sm:text-4xl text-ink tracking-tight">
            BROKEN CHAINS
          </h1>
        </div>
        <p className="text-ink/50 leading-relaxed max-w-2xl">
          Which traditions are being kept, quietly rewritten, or set down for good.
          Every number here comes from someone telling us what happened in their own family.
        </p>
      </div>

      {/* Sort */}
      <div className="flex flex-wrap gap-1 mb-8 bg-ink/5 rounded-lg p-1 w-fit">
        {(Object.keys(sortLabels) as SortMode[]).map((mode) => (
          <button
            key={mode}
            onClick={() => setSort(mode)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              sort === mode ? 'bg-cream text-ink shadow-sm' : 'text-ink/40 hover:text-ink/60'
            }`}
          >
            {sortLabels[mode]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-ink/30 text-sm">Counting...</div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">⛓️‍💥</div>
          <p className="text-ink/40 font-medium mb-2">Nobody has answered yet.</p>
          <p className="text-sm text-ink/30 max-w-sm mx-auto leading-relaxed">
            Open any case file and tell us what happened to that one in your family.
            This board fills itself from there.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-ink text-cream rounded-lg font-medium text-sm hover:bg-navy transition-colors"
          >
            Browse the case files
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(({ s, tally }) => {
            const total = tallyTotal(tally);
            return (
              <Link
                key={s.id}
                href={`/superstition/${s.id}`}
                className="block paper-card rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="min-w-0">
                    <h2 className="font-display text-base text-ink tracking-tight leading-snug mb-1">
                      {s.title}
                    </h2>
                    <div className="text-xs text-ink/40">
                      {s.countryFlag} {s.country} · {categoryLabels[s.category]}
                    </div>
                  </div>
                  <span className="text-xs text-ink/30 shrink-0">
                    {total} {total === 1 ? 'family' : 'families'}
                  </span>
                </div>

                <div className="flex h-2.5 rounded-full overflow-hidden bg-ink/5 mb-2.5">
                  {stances.map((st) =>
                    tally[st] > 0 ? (
                      <div
                        key={st}
                        className={stanceColors[st].bar}
                        style={{ width: `${tallyPercent(tally, st)}%` }}
                        title={`${stanceLabels[st]}: ${tally[st]}`}
                      />
                    ) : null
                  )}
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  {stances
                    .filter((st) => tally[st] > 0)
                    .map((st) => (
                      <div key={st} className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${stanceColors[st].dot}`} />
                        <span className="text-[11px] text-ink/40">
                          {tallyPercent(tally, st)}% {stanceLabels[st].toLowerCase()}
                        </span>
                      </div>
                    ))}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
