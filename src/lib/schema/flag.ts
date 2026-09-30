import { z } from 'zod';

export const flagTargetTypeSchema = z.enum(['entry', 'chainEntry']);

export type FlagTargetType = z.infer<typeof flagTargetTypeSchema>;

export const flagReasonSchema = z.enum([
  'inaccurate',
  'offensive',
  'personalInfo',
  'spam',
  'other',
]);

export type FlagReason = z.infer<typeof flagReasonSchema>;

export const flagSchema = z.object({
  targetType: flagTargetTypeSchema,
  targetId: z.string().min(1).max(120),
  entryId: z.string().min(1).max(120),
  visitorId: z.string().uuid(),
  reason: flagReasonSchema,
  note: z.string().max(500).optional(),
  createdAt: z.coerce.date(),
  resolvedAt: z.coerce.date().optional(),
});

export type Flag = z.infer<typeof flagSchema>;
