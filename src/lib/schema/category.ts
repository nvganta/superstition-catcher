import { z } from 'zod';

export const categorySchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z][a-zA-Z0-9]*$/),
  label: z.string().min(1).max(120),
  description: z.string().min(1).max(500),
  sortOrder: z.number().int().nonnegative(),
  parentSlug: z
    .string()
    .min(1)
    .max(64)
    .regex(/^[a-z][a-zA-Z0-9]*$/)
    .optional(),
});

export type Category = z.infer<typeof categorySchema>;

export const categoryDocumentSchema = categorySchema;

export type CategoryDocument = z.infer<typeof categoryDocumentSchema>;
