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

/** Community "Broken Chain" story attached to a tradition entry. */
export const chainEntrySchema = z.object({
  id: z.string().uuid(),
  entryId: z.string().min(1).max(120),
  visitorId: z.string().uuid(),
  name: z.string().min(1).max(80),
  text: z.string().min(1).max(2000),
  status: entryStatusSchema.default('live'),
  flagCount: z.number().int().nonnegative().default(0),
  region: regionSchema.optional(),
  generationBand: generationBandSchema.optional(),
  researchConsent: z.boolean().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ChainEntry = z.infer<typeof chainEntrySchema>;
