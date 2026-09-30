import { z } from 'zod';

export const regionSchema = z.enum([
  'india',
  'japan',
  'china',
  'middleEast',
  'europe',
  'americas',
  'africa',
]);

export type Region = z.infer<typeof regionSchema>;

export const legacyCategorySchema = z.enum([
  'numbers',
  'animals',
  'foodAndEating',
  'deathAndAfterlife',
  'marriageAndLove',
  'homeAndDaily',
  'travelAndJourney',
]);

export type LegacyCategory = z.infer<typeof legacyCategorySchema>;

export const verdictSchema = z.enum(['busted', 'hasMerit', 'practicalOrigin']);

export type Verdict = z.infer<typeof verdictSchema>;

export const sourceKindSchema = z.enum(['book', 'paper', 'oral', 'web']);

export type SourceKind = z.infer<typeof sourceKindSchema>;

export const confidenceSchema = z.enum(['established', 'likely', 'speculative']);

export type Confidence = z.infer<typeof confidenceSchema>;

export const entryOriginSchema = z.enum(['community', 'curated']);

export type EntryOrigin = z.infer<typeof entryOriginSchema>;

export const entryStatusSchema = z.enum([
  'live',
  'flagged',
  'underReview',
  'hidden',
  'removed',
]);

export type EntryStatus = z.infer<typeof entryStatusSchema>;

export const sourceSchema = z.object({
  title: z.string().min(1).max(200),
  url: z.string().url().optional(),
  kind: sourceKindSchema,
});

export type Source = z.infer<typeof sourceSchema>;

export const entryLegacySchema = z.object({
  verdict: verdictSchema,
  theRealReason: z.string().min(1),
  funFact: z.string().optional(),
  legacyCategory: legacyCategorySchema,
});

export type EntryLegacy = z.infer<typeof entryLegacySchema>;
