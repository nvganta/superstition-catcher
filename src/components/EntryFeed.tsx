'use client';

import { useState } from 'react';
import type { Region } from '@/lib/schema/common';
import type { PublicEntry } from '@/lib/entries/documents';
import { REGIONS, regionLabels, type CategoryLabels } from '@/lib/entries/labels';
import EntryCard from './EntryCard';

export default function EntryFeed({
  entries,
  categoryLabels,
}: {
  entries: PublicEntry[];
  categoryLabels: CategoryLabels;
}) {
  const [activeRegion, setActiveRegion] = useState<Region | 'all'>('all');
  const filtered =
    activeRegion === 'all' ? entries : entries.filter((entry) => entry.region === activeRegion);

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-8">
        {(['all', ...REGIONS] as const).map((region) => (
          <button
            key={region}
            onClick={() => setActiveRegion(region)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeRegion === region
                ? 'bg-ink text-cream shadow-md'
                : 'bg-ink/5 text-ink/50 hover:bg-ink/10 hover:text-ink/70'
            }`}
          >
            {region === 'all' ? '🌍 All Regions' : regionLabels[region]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((entry) => (
          <EntryCard key={entry.id} entry={entry} categoryLabels={categoryLabels} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📭</div>
          <p className="font-display text-ink/40">No entries for this region yet.</p>
        </div>
      )}
    </>
  );
}
