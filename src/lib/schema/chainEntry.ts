import { z } from 'zod';
import { entryStatusSchema, regionSchema } from './common';

export const generationBandSchema = z.enum([
  'genZ',
  'millennial',
  'genX',
  'boomer',
  'silent',
  'unknown',
]);

export type GenerationBand = z.infer<typeof generationBandSchema>;

export const chainStorySchema = z.object({
  name: z.string().min(1).max(80).optional(),
  text: z.string().min(1).max(2000),
});

export type ChainStory = z.infer<typeof chainStorySchema>;

/**
 * One visitor's Broken Chain answer for one entry: was the tradition handed to them, do they
 * keep it, and optionally the story behind that. Unique on (entryId, visitorId).
 */
export const chainEntrySchema = z.object({
  id: z.string().uuid(),
  entryId: z.string().min(1).max(120),
  visitorId: z.string().uuid(),
  passedDown: z.boolean(),
  kept: z.boolean(),
  story: chainStorySchema.optional(),
  region: regionSchema.optional(),
  generationBand: generationBandSchema.optional(),
  researchConsent: z.boolean().optional(),
  status: entryStatusSchema.default('live'),
  flagCount: z.number().int().nonnegative().default(0),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ChainEntry = z.infer<typeof chainEntrySchema>;
