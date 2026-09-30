import { z } from 'zod';

export const reactionKindSchema = z.enum(['rate', 'save', 'hide']);

export type ReactionKind = z.infer<typeof reactionKindSchema>;

export const reactionSchema = z.object({
  entryId: z.string().min(1).max(120),
  visitorId: z.string().uuid(),
  kind: reactionKindSchema,
  value: z.union([z.number(), z.boolean(), z.string()]),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

export type Reaction = z.infer<typeof reactionSchema>;
