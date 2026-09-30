import { describe, expect, it } from 'vitest';
import { categorySchema } from './category';
import { entrySchema } from './entry';
import { entryVersionSchema } from './entryVersion';
import { flagSchema } from './flag';
import { reactionSchema } from './reaction';
import { chainEntrySchema } from './chainEntry';
import { aiNoteSchema } from './aiNote';
import { visitorSchema } from './visitor';
import { rateLimitSchema } from './rateLimit';
import { mapLegacyCategoryToSlugs } from './categoryMapping';

const baseEntry = {
  id: 'test-entry',
  title: 'Test Entry',
  country: 'India',
  countryFlag: '🇮🇳',
  region: 'india' as const,
  categorySlugs: ['home'],
  tags: [],
  theDefault: 'People believe X',
  whyItStarted: 'It started because',
  whyItStuck: 'It stuck because',
  whatsChangedSince: 'Today it looks like',
  sources: [],
  origin: 'curated' as const,
  status: 'live' as const,
  flagCount: 0,
  version: 1,
  legacy: {
    verdict: 'busted' as const,
    theRealReason: 'Because science',
    legacyCategory: 'homeAndDaily' as const,
  },
  confidence: 'likely' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('schema validation', () => {
  it('validates category documents', () => {
    expect(
      categorySchema.parse({
        slug: 'job',
        label: 'Job & Work',
        description: 'Work customs',
        sortOrder: 1,
      })
    ).toMatchObject({ slug: 'job' });
  });

  it('maps legacy categories to new slugs', () => {
    expect(mapLegacyCategoryToSlugs('foodAndEating')).toEqual(['food']);
    expect(mapLegacyCategoryToSlugs('deathAndAfterlife')).toEqual(['deathRites']);
  });

  it('requires curated entries to have confidence and legacy or sources', () => {
    expect(() => entrySchema.parse(baseEntry)).not.toThrow();

    expect(() =>
      entrySchema.parse({
        ...baseEntry,
        confidence: undefined,
      })
    ).toThrow();

    expect(() =>
      entrySchema.parse({
        ...baseEntry,
        legacy: undefined,
        sources: [],
      })
    ).toThrow();
  });

  it('allows community entries without confidence or sources', () => {
    const parsed = entrySchema.parse({
      ...baseEntry,
      origin: 'community',
      confidence: undefined,
      legacy: undefined,
      sources: [],
    });

    expect(parsed.origin).toBe('community');
  });

  it('validates entry versions', () => {
    const { createdAt, updatedAt, ...snapshot } = baseEntry;
    void createdAt;
    void updatedAt;
    expect(
      entryVersionSchema.parse({
        entryId: baseEntry.id,
        version: 1,
        snapshot,
        createdAt: new Date(),
      })
    ).toMatchObject({ entryId: 'test-entry' });
  });

  it('validates flag, reaction, chain entry, ai note, visitor, and rate limit', () => {
    expect(
      flagSchema.parse({
        targetType: 'entry',
        targetId: 'test-entry',
        entryId: 'test-entry',
        visitorId: '00000000-0000-4000-8000-000000000001',
        reason: 'spam',
        createdAt: new Date(),
      })
    ).toBeTruthy();

    expect(
      reactionSchema.parse({
        entryId: 'test-entry',
        visitorId: '00000000-0000-4000-8000-000000000001',
        kind: 'save',
        value: true,
      })
    ).toBeTruthy();

    expect(
      chainEntrySchema.parse({
        id: '00000000-0000-4000-8000-000000000002',
        entryId: 'test-entry',
        visitorId: '00000000-0000-4000-8000-000000000001',
        name: 'Alex',
        text: 'My grandmother still does this.',
        status: 'live',
        flagCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    ).toBeTruthy();

    expect(
      aiNoteSchema.parse({
        id: '00000000-0000-4000-8000-000000000003',
        entryId: 'test-entry',
        kind: 'summary',
        content: 'Draft note',
        createdAt: new Date(),
      })
    ).toBeTruthy();

    expect(
      visitorSchema.parse({
        id: '00000000-0000-4000-8000-000000000001',
        createdAt: new Date(),
      })
    ).toBeTruthy();

    expect(
      rateLimitSchema.parse({
        visitorId: '00000000-0000-4000-8000-000000000001',
        action: 'newEntry',
        count: 1,
        windowStart: new Date(),
        expiresAt: new Date(Date.now() + 86_400_000),
      })
    ).toBeTruthy();
  });
});
