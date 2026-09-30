import type { Superstition } from '@/data/superstitions';
import { mapLegacyCategoryToSlugs } from '@/lib/schema/categoryMapping';
import type { EntryInsert } from '@/lib/schema/entry';

const PRACTICAL_KEYWORDS = [
  'insecticide',
  'allergen',
  'chemistry',
  'studies have shown',
  'scientific',
  'bacteria',
  'pest',
  'repellent',
  'medical',
  'physiological',
  'evidence suggests',
  'research',
  'allerg',
  'mites',
  'preserv',
];

const CULTURAL_KEYWORDS = [
  'tradition',
  'ritual',
  'belief',
  'superstition',
  'custom',
  'culture',
  'social',
  'religious',
  'symbol',
  'taboo',
  'auspicious',
  'fortune',
  'evil eye',
  'ancestors',
  'community',
];

export interface MigrationEditorialFlag {
  entryId: string;
  title: string;
  reason: string;
}

export interface MappedEntryResult {
  entry: EntryInsert;
  editorialFlag?: MigrationEditorialFlag;
}

function shouldFlagWhyItStuckForReview(theRealReason: string): boolean {
  const lower = theRealReason.toLowerCase();
  const hasPractical = PRACTICAL_KEYWORDS.some((word) => lower.includes(word));
  const hasCultural = CULTURAL_KEYWORDS.some((word) => lower.includes(word));
  return hasPractical && !hasCultural;
}

export function mapSuperstitionToEntry(
  superstition: Superstition,
  timestamps?: { createdAt?: Date; updatedAt?: Date }
): MappedEntryResult {
  const now = new Date();
  const whyItStuck = superstition.theRealReason;
  const editorialFlag = shouldFlagWhyItStuckForReview(superstition.theRealReason)
    ? {
        entryId: superstition.id,
        title: superstition.title,
        reason:
          'whyItStuck seeded from theRealReason reads as practical/scientific rather than cultural persistence; needs editorial review',
      }
    : undefined;

  const entry: EntryInsert = {
    id: superstition.id,
    title: superstition.title,
    country: superstition.country,
    countryFlag: superstition.countryFlag,
    region: superstition.region,
    categorySlugs: mapLegacyCategoryToSlugs(superstition.category),
    tags: [],
    theDefault: superstition.whatPeopleBelieve,
    whyItStarted: superstition.historicalOrigin,
    whyItStuck,
    whatsChangedSince: superstition.modernTwist,
    sources: [],
    confidence: 'likely',
    origin: 'curated',
    status: 'live',
    flagCount: 0,
    version: 1,
    legacy: {
      verdict: superstition.verdict,
      theRealReason: superstition.theRealReason,
      funFact: superstition.funFact,
      legacyCategory: superstition.category,
    },
    createdAt: timestamps?.createdAt ?? now,
    updatedAt: timestamps?.updatedAt ?? now,
  };

  return { entry, editorialFlag };
}

export function entryToVersionSnapshot(entry: EntryInsert) {
  const { createdAt, updatedAt, ...snapshot } = entry;
  void createdAt;
  void updatedAt;
  return snapshot;
}
