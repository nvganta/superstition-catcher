import type { Category } from '@/lib/schema/category';
import type { GenerationBand } from '@/lib/schema/chainEntry';
import type { Confidence, EntryOrigin, EntryStatus, Region, SourceKind } from '@/lib/schema/common';
import type { FlagReason } from '@/lib/schema/flag';
import type { StatusEvent } from '@/lib/schema/statusTransition';

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

export const generationBandLabels: Record<GenerationBand, string> = {
  genZ: 'Gen Z',
  millennial: 'Millennial',
  genX: 'Gen X',
  boomer: 'Boomer',
  silent: 'Silent generation',
  unknown: 'Not sure',
};

export const GENERATION_BANDS = Object.keys(generationBandLabels) as GenerationBand[];

export const flagReasonLabels: Record<FlagReason, string> = {
  inaccurate: 'It is wrong or misleading',
  offensive: 'It is hateful or offensive',
  personalInfo: "It shares someone's personal details",
  spam: 'It is spam or an ad',
  other: 'Something else',
};

export const FLAG_REASONS = Object.keys(flagReasonLabels) as FlagReason[];

export const statusLabels: Record<EntryStatus, string> = {
  live: 'Live',
  flagged: 'Flagged',
  underReview: 'Under review',
  hidden: 'Hidden',
  removed: 'Removed',
};

export const statusEventLabels: Record<StatusEvent, string> = {
  flagThresholdReached: 'Flag threshold reached',
  dismissFlags: 'Dismiss reports',
  startReview: 'Take down for review',
  restore: 'Restore',
  hide: 'Hide',
  remove: 'Remove',
};
