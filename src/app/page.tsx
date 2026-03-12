'use client';

import { useState, useMemo } from 'react';
import { superstitions, regionLabels, type Region } from '@/data/superstitions';
import SuperstitionCard from '@/components/SuperstitionCard';
import SearchBar from '@/components/SearchBar';

export default function HomePage() {
  const [activeRegion, setActiveRegion] = useState<Region | 'all'>('all');

  // Pick a "superstition of the day" based on the date
  const dailySuperstition = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    return superstitions[dayOfYear % superstitions.length];
  }, []);

  const filtered = useMemo(() => {
    const list =
      activeRegion === 'all'
        ? superstitions
        : superstitions.filter((s) => s.region === activeRegion);
    return list.filter((s) => s.id !== dailySuperstition.id);
  }, [activeRegion, dailySuperstition.id]);

  const regions: (Region | 'all')[] = [
    'all',
    'india',
    'japan',
    'china',
    'middleEast',
    'europe',
    'americas',
    'africa',
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Hero Section */}
      <section className="pt-12 pb-10 sm:pt-16 sm:pb-14">
        <div className="max-w-3xl">
          <div className="evidence-tag inline-block mb-4">Active Investigation</div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-ink leading-[1.1] mb-5">
            Every superstition
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
            We investigate superstitions from around the world — uncovering the
            real history and science behind the myths your grandma swore by.
          </p>
          <SearchBar />
        </div>
      </section>

      <hr className="case-divider mb-10" />

      {/* Superstition of the Day */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xl">📋</span>
          <h2 className="font-display text-lg text-ink tracking-tight">
            CASE OF THE DAY
          </h2>
          <div className="flex-grow h-px bg-ink/10" />
        </div>
        <SuperstitionCard superstition={dailySuperstition} featured />
      </section>

      <hr className="case-divider mb-10" />

      {/* All Cases Feed */}
      <section className="pb-16">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xl">🗂️</span>
          <h2 className="font-display text-lg text-ink tracking-tight">
            ALL MYTHS
          </h2>
          <div className="flex-grow h-px bg-ink/10" />
        </div>

        {/* Region Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {regions.map((r) => (
            <button
              key={r}
              onClick={() => setActiveRegion(r)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeRegion === r
                  ? 'bg-ink text-cream shadow-md'
                  : 'bg-ink/5 text-ink/50 hover:bg-ink/10 hover:text-ink/70'
              }`}
            >
              {r === 'all' ? '🌍 All Regions' : `${regionLabels[r]}`}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((s) => (
            <div key={s.id}>
              <SuperstitionCard superstition={s} />
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-display text-ink/40">
              No myths found for this region yet.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
