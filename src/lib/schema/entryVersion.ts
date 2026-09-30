import { z } from 'zod';
import { entryFieldsSchema } from './entry';

export const entryVersionSchema = z.object({
  entryId: z.string().min(1).max(120),
  version: z.number().int().positive(),
  snapshot: entryFieldsSchema.omit({ createdAt: true, updatedAt: true }),
  createdAt: z.coerce.date(),
});

export type EntryVersion = z.infer<typeof entryVersionSchema>;
