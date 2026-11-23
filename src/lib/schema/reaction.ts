import { z } from 'zod';

export const reactionKindSchema = z.enum(['rate', 'save', 'hide']);

export type ReactionKind = z.infer<typeof reactionKindSchema>;

export const RATING_MIN = 1;
export const RATING_MAX = 5;

export const ratingSchema = z.number().int().min(RATING_MIN).max(RATING_MAX);

export const legacyReactionTypeSchema = z.enum(['like', 'dislike', 'mind_blown']);

export type LegacyReactionType = z.infer<typeof legacyReactionTypeSchema>;

const reactionBase = {
  entryId: z.string().min(1).max(120),
  visitorId: z.string().uuid(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  /** Set only by scripts/migrate-reactions.ts, naming the emoji reaction this rating came from. */
  legacyType: legacyReactionTypeSchema.optional(),
};

/** A reaction document exists only while it is set. Unsaving or unhiding deletes it. */
export const reactionSchema = z.discriminatedUnion('kind', [
  z.object({ ...reactionBase, kind: z.literal('rate'), value: ratingSchema }),
  z.object({ ...reactionBase, kind: z.literal('save'), value: z.literal(true) }),
  z.object({ ...reactionBase, kind: z.literal('hide'), value: z.literal(true) }),
]);

export type Reaction = z.infer<typeof reactionSchema>;
