import type { Category } from '@/lib/schema/category';
import type { Confidence, EntryOrigin, Region, SourceKind } from '@/lib/schema/common';

export const regionLabels: Record<Region, string> = {
  india: 'India',
  japan: 'Japan',
  china: 'China',
  middleEast: 'Middle East',
  europe: 'Europe',
  americas: 'Americas',
  africa: 'Africa',
};

export const regionEmojis: Record<Region, string> = {
  india: '🇮🇳',
  japan: '🇯🇵',
  china: '🇨🇳',
  middleEast: '🕌',
  europe: '🏰',
  americas: '🗽',
  africa: '🌍',
};

export const REGIONS = Object.keys(regionLabels) as Region[];

export const confidenceLabels: Record<Confidence, { label: string; description: string }> = {
  established: {
    label: 'Well established',
    description: 'Historians and sources broadly agree on this account.',
  },
  likely: {
    label: 'Likely',
    description: 'The best available account, though some details are contested.',
  },
  speculative: {
    label: 'Speculative',
    description: 'A plausible reading with thin evidence. Treat it as a lead, not a fact.',
  },
};

export const originLabels: Record<EntryOrigin, string> = {
  curated: 'Curated',
  community: 'Community',
};

export const sourceKindLabels: Record<SourceKind, string> = {
  book: 'Book',
  paper: 'Paper',
  oral: 'Oral history',
  web: 'Web',
};

const categoryEmojis: Record<string, string> = {
  job: '💼',
  education: '🎓',
  family: '👪',
  health: '🩺',
  money: '💰',
  marriage: '💍',
  food: '🍽️',
  home: '🏠',
  deathRites: '🕯️',
  numbers: '🔢',
  animals: '🐾',
  travel: '🧳',
  religionRituals: '🪔',
};

export function categoryEmoji(slug: string): string {
  return categoryEmojis[slug] ?? '📂';
}

export type CategoryLabels = Record<string, string>;

export function categoryLabelMap(categories: Category[]): CategoryLabels {
  return Object.fromEntries(categories.map((category) => [category.slug, category.label]));
}
