import { z } from 'zod';
import {
  confidenceSchema,
  entryLegacySchema,
  entryOriginSchema,
  entryStatusSchema,
  regionSchema,
  sourceSchema,
} from './common';

export const entryFieldsSchema = z.object({
  id: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().min(1).max(200),
  country: z.string().min(1).max(80),
  countryFlag: z.string().min(1).max(8),
  region: regionSchema,
  categorySlugs: z.array(z.string().min(1).max(64)).min(1),
  tags: z.array(z.string().min(1).max(50)).max(20).default([]),
  theDefault: z.string().min(1).max(5000),
  whyItStarted: z.string().min(1).max(5000),
  whyItStuck: z.string().min(1).max(5000),
  whatsChangedSince: z.string().min(1).max(5000),
  freshLook: z.string().max(5000).optional(),
  sources: z.array(sourceSchema).max(20).default([]),
  confidence: confidenceSchema.optional(),
  uncertaintyNote: z.string().max(1000).optional(),
  origin: entryOriginSchema,
  status: entryStatusSchema,
  postedByVisitorId: z.string().uuid().optional(),
  postedBy: z.string().max(80).optional(),
  flagCount: z.number().int().nonnegative().default(0),
  version: z.number().int().positive(),
  legacy: entryLegacySchema.optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

function curatedEntryRefinement(data: {
  origin: z.infer<typeof entryOriginSchema>;
  confidence?: z.infer<typeof confidenceSchema>;
  sources: z.infer<typeof sourceSchema>[];
  legacy?: z.infer<typeof entryLegacySchema>;
}, ctx: z.RefinementCtx) {
  if (data.origin !== 'curated') {
    return;
  }

  if (!data.confidence) {
    ctx.addIssue({
      code: 'custom',
      message: 'Curated entries require a confidence level',
      path: ['confidence'],
    });
  }

  const hasSources = data.sources.length > 0;
  const hasLegacy = data.legacy != null;

  if (!hasSources && !hasLegacy) {
    ctx.addIssue({
      code: 'custom',
      message: 'Curated entries require at least one source or legacy data',
      path: ['sources'],
    });
  }
}

export const entrySchema = entryFieldsSchema.superRefine(curatedEntryRefinement);

export type Entry = z.infer<typeof entrySchema>;

export const entryInsertSchema = entryFieldsSchema
  .omit({ createdAt: true, updatedAt: true })
  .extend({
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
  })
  .superRefine(curatedEntryRefinement);

export type EntryInsert = z.infer<typeof entryInsertSchema>;
