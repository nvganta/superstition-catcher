import type { LegacyCategory } from './common';

/** Maps the legacy 7 Category enum values to new category slugs. */
export const LEGACY_CATEGORY_TO_SLUGS: Record<LegacyCategory, readonly string[]> = {
  numbers: ['numbers'],
  animals: ['animals'],
  foodAndEating: ['food'],
  deathAndAfterlife: ['deathRites'],
  marriageAndLove: ['marriage'],
  homeAndDaily: ['home'],
  travelAndJourney: ['travel'],
} as const;

export function mapLegacyCategoryToSlugs(category: LegacyCategory): string[] {
  return [...LEGACY_CATEGORY_TO_SLUGS[category]];
}
