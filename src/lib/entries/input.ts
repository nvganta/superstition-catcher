import { z } from 'zod';
import { FIELD_LIMITS } from '@/lib/guardrails/limits';
import {
  confidenceSchema,
  entryStatusSchema,
  regionSchema,
  sourceKindSchema,
} from '@/lib/schema/common';

const blankToUndefined = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value;

const requiredText = (max: number) =>
  z.string().trim().min(1, 'This field is required').max(max, `Keep this under ${max} characters`);

const optionalText = (max: number) =>
  z.preprocess(
    blankToUndefined,
    z.string().trim().max(max, `Keep this under ${max} characters`).optional()
  );

const sourceInputSchema = z.object({
  title: requiredText(FIELD_LIMITS.sourceTitle),
  url: z.preprocess(
    blankToUndefined,
    z
      .string()
      .trim()
      .url('Source link must be a full URL')
      .refine((url) => /^https?:\/\//i.test(url), 'Source link must start with http:// or https://')
      .optional()
  ),
  kind: sourceKindSchema,
});

const narrativeFields = {
  theDefault: requiredText(FIELD_LIMITS.theDefault),
  whyItStarted: requiredText(FIELD_LIMITS.whyItStarted),
  whyItStuck: requiredText(FIELD_LIMITS.whyItStuck),
  whatsChangedSince: requiredText(FIELD_LIMITS.whatsChangedSince),
  freshLook: optionalText(FIELD_LIMITS.freshLook),
};

const placeFields = {
  title: requiredText(FIELD_LIMITS.title),
  country: requiredText(FIELD_LIMITS.country),
  region: regionSchema,
  postedBy: optionalText(FIELD_LIMITS.postedBy),
};

export const communityEntryInputSchema = z.object({
  visitorId: z.string().uuid('Missing visitor id; reload the page and try again'),
  ...placeFields,
  countryFlag: optionalText(8),
  categorySlugs: z
    .array(z.string().min(1))
    .min(1, 'Pick at least one category')
    .max(3, 'Pick up to three categories'),
  ...narrativeFields,
  sources: z.array(sourceInputSchema).max(5).default([]),
});

export type CommunityEntryInput = z.infer<typeof communityEntryInputSchema>;

const adminEntryFields = {
  ...placeFields,
  countryFlag: requiredText(8),
  categorySlugs: z.array(z.string().min(1)).min(1, 'Pick at least one category'),
  tags: z.array(z.string().trim().min(1).max(FIELD_LIMITS.tag)).max(FIELD_LIMITS.maxTags).default([]),
  ...narrativeFields,
  sources: z.array(sourceInputSchema).max(FIELD_LIMITS.maxSources).default([]),
  confidence: z.preprocess(blankToUndefined, confidenceSchema.optional()),
  uncertaintyNote: optionalText(FIELD_LIMITS.uncertaintyNote),
  status: entryStatusSchema.default('live'),
};

export const adminEntryCreateSchema = z.object({
  id: z.preprocess(
    blankToUndefined,
    z
      .string()
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single hyphens')
      .optional()
  ),
  ...adminEntryFields,
});

export const adminEntryUpdateSchema = z.object({
  ...adminEntryFields,
  version: z.number().int().positive(),
});
