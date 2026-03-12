'use client';

import { useState } from 'react';
import {
  categoryLabels,
  categoryEmojis,
  getSuperstitionsByCategory,
  superstitions,
  type Category,
} from '@/data/superstitions';
import SuperstitionCard from '@/components/SuperstitionCard';

const categoryDescriptions: Record<Category, string> = {
  numbers:
    'Why is 4 deadly in Asia and 13 cursed in the West? The strange world of number superstitions.',
  animals:
    'Black cats, cawing crows, and ominous owls — animals have been omens for millennia.',
  foodAndEating:
    'From eclipse fasting to midnight grapes — what you eat (and when) has always carried meaning.',
  deathAndAfterlife:
    'Chopstick taboos, sleeping directions, and funeral rituals that shaped daily life.',
  marriageAndLove:
    'Turmeric ceremonies, evil eyes, and lucky red — love and marriage wrapped in tradition.',
  homeAndDaily:
    'Nail-cutting, sweeping, mirrors, and more — the superstitions that govern everyday routines.',
  travelAndJourney:
    'Eye twitches, ladder-walking, and omens for the road — superstitions for when you leave home.',
};

const categoryColors: Record<Category, string> = {
  numbers: 'from-lavender/30 to-slate-blue/10',
  animals: 'from-sage/30 to-teal/10',
  foodAndEating: 'from-amber/25 to-coral/10',
  deathAndAfterlife: 'from-ink/10 to-slate-blue/10',
  marriageAndLove: 'from-dusty-rose/30 to-coral/10',
  homeAndDaily: 'from-amber/20 to-evidence-yellow/15',
  travelAndJourney: 'from-teal/20 to-stamp-blue/10',
};

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const allCategories = Object.keys(categoryLabels) as Category[];

  const selectedSuperstitions = selectedCategory
    ? getSuperstitionsByCategory(selectedCategory)
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="evidence-tag inline-block mb-4">Classification</div>
        <h1 className="font-display text-3xl sm:text-4xl text-ink leading-tight mb-3">
          Browse by Category
        </h1>
        <p className="text-ink/50 max-w-xl">
          Superstitions sorted by what they&apos;re actually about.
          Same themes pop up across cultures — proof that humans everywhere worry about the same stuff.
        </p>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {allCategories.map((category) => {
          const count = superstitions.filter((s) => s.category === category).length;
          const isSelected = selectedCategory === category;

          return (
            <button
              key={category}
              onClick={() =>
                setSelectedCategory(isSelected ? null : category)
              }
              className={`relative overflow-hidden rounded-xl p-6 text-left transition-all hover-lift ${
                isSelected
                  ? 'ring-2 ring-ink shadow-lg scale-[1.02]'
                  : 'ring-1 ring-ink/10'
              }`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${categoryColors[category]}`}
              />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-3xl">{categoryEmojis[category]}</span>
                  <span
                    className={`text-xs font-mono px-2 py-1 rounded-full ${
                      isSelected
                        ? 'bg-ink text-cream'
                        : 'bg-ink/10 text-ink/50'
                    }`}
                  >
                    {count} myth{count !== 1 ? 's' : ''}
                  </span>
                </div>
                <h3 className="font-display text-lg text-ink mb-1">
                  {categoryLabels[category]}
                </h3>
                <p className="text-sm text-ink/50 leading-relaxed line-clamp-2">
                  {categoryDescriptions[category]}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Category Cases */}
      {selectedCategory && (
        <section>
          <hr className="case-divider mb-8" />
          <div className="flex items-center gap-3 mb-6">
            <span className="text-xl">{categoryEmojis[selectedCategory]}</span>
            <h2 className="font-display text-lg text-ink tracking-tight">
              {categoryLabels[selectedCategory].toUpperCase()} MYTHS
            </h2>
            <div className="flex-grow h-px bg-ink/10" />
            <span className="text-sm text-ink/40 font-mono">
              {selectedSuperstitions.length} found
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {selectedSuperstitions.map((s) => (
              <SuperstitionCard key={s.id} superstition={s} />
            ))}
          </div>
        </section>
      )}

      {!selectedCategory && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">👆</div>
          <p className="text-ink/40 font-medium">
            Pick a category to explore its myths
          </p>
        </div>
      )}
    </div>
  );
}
