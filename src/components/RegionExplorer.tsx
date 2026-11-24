'use client';

import { useState } from 'react';
import type { Region } from '@/lib/schema/common';
import type { PublicEntry } from '@/lib/entries/documents';
import { REGIONS, regionEmojis, regionLabels, type CategoryLabels } from '@/lib/entries/labels';
import EntryCard from './EntryCard';

const regionColors: Record<Region, { bg: string; accent: string; pattern: string }> = {
  india: {
    bg: 'from-amber/20 to-coral/10',
    accent: 'bg-amber',
    pattern: 'pattern-dots text-amber/10',
  },
  japan: {
    bg: 'from-stamp-red/10 to-dusty-rose/20',
    accent: 'bg-stamp-red',
    pattern: 'pattern-lines text-stamp-red/8',
  },
  china: {
    bg: 'from-stamp-red/15 to-amber/10',
    accent: 'bg-stamp-red',
    pattern: 'pattern-cross text-stamp-red/8',
  },
  middleEast: {
    bg: 'from-teal/15 to-stamp-blue/10',
    accent: 'bg-teal',
    pattern: 'pattern-dots text-teal/10',
  },
  europe: {
    bg: 'from-slate-blue/15 to-lavender/20',
    accent: 'bg-slate-blue',
    pattern: 'pattern-lines text-slate-blue/8',
  },
  americas: {
    bg: 'from-coral/15 to-amber/10',
    accent: 'bg-coral',
    pattern: 'pattern-zigzag text-coral/8',
  },
  africa: {
    bg: 'from-sage/20 to-teal/10',
    accent: 'bg-sage',
    pattern: 'pattern-cross text-sage/15',
  },
};

const regionDescriptions: Record<Region, string> = {
  india:
    'From sacred trees to turmeric rituals, Indian defaults blend ancient wisdom with practical life hacks.',
  japan:
    'Death, numbers, and chopstick etiquette. Japanese customs reveal a culture deeply aware of symbolism.',
  china:
    'Lucky 8s, unlucky 4s, and forbidden clocks. Chinese customs show the power of language over belief.',
  middleEast:
    'The evil eye, sacred hands, and protective amulets. Middle Eastern beliefs span millennia.',
  europe:
    'Ladders, mirrors, and Friday the 13th. European habits shaped the Western world.',
  americas:
    'Evil eyes, midnight grapes, and New Year\'s rituals. The Americas blend indigenous and imported beliefs.',
  africa:
    'Owls, ancestors, and personal space. African customs carry deep community wisdom.',
};

export default function RegionExplorer({
  entries,
  categoryLabels,
}: {
  entries: PublicEntry[];
  categoryLabels: CategoryLabels;
}) {
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const selectedEntries = selectedRegion
    ? entries.filter((entry) => entry.region === selectedRegion)
    : [];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {REGIONS.map((region) => {
          const colors = regionColors[region];
          const count = entries.filter((entry) => entry.region === region).length;
          const isSelected = selectedRegion === region;

          return (
            <button
              key={region}
              onClick={() =>
                setSelectedRegion(isSelected ? null : region)
              }
              className={`relative overflow-hidden rounded-xl p-6 text-left transition-all hover-lift ${
                isSelected
                  ? 'ring-2 ring-ink shadow-lg scale-[1.02]'
                  : 'ring-1 ring-ink/10'
              }`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${colors.bg}`}
              />
              <div
                className={`absolute inset-0 ${colors.pattern} opacity-50`}
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{regionEmojis[region]}</span>
                  <span
                    className={`text-xs font-mono px-2 py-1 rounded-full ${
                      isSelected
                        ? 'bg-ink text-cream'
                        : 'bg-ink/10 text-ink/50'
                    }`}
                  >
                    {count} entr{count !== 1 ? 'ies' : 'y'}
                  </span>
                </div>
                <h3 className="font-display text-xl text-ink mb-1">
                  {regionLabels[region]}
                </h3>
                <p className="text-sm text-ink/50 leading-relaxed line-clamp-2">
                  {regionDescriptions[region]}
                </p>
              </div>

              {isSelected && (
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 ${colors.accent}`}
                />
              )}
            </button>
          );
        })}
      </div>

      {selectedRegion && (
        <section>
          <hr className="case-divider mb-8" />
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xl">{regionEmojis[selectedRegion]}</span>
            <h2 className="font-display text-lg text-ink tracking-tight">
              {regionLabels[selectedRegion].toUpperCase()} ENTRIES
            </h2>
            <div className="flex-grow h-px bg-ink/10" />
            <span className="text-sm text-ink/40 font-mono">
              {selectedEntries.length} found
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {selectedEntries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} categoryLabels={categoryLabels} />
            ))}
          </div>
        </section>
      )}

      {!selectedRegion && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">👆</div>
          <p className="text-ink/40 font-medium">
            Select a region above to explore its entries
          </p>
        </div>
      )}
    </>
  );
}
