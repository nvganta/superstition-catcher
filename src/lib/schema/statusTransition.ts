import { z } from 'zod';
import { entryStatusSchema } from './common';
import { flagTargetTypeSchema } from './flag';

export const statusEventSchema = z.enum(['flagThresholdReached', 'dismissFlags', 'startReview', 'restore', 'hide', 'remove']);

export type StatusEvent = z.infer<typeof statusEventSchema>;

export const statusActorSchema = z.enum(['system', 'admin']);

export type StatusActor = z.infer<typeof statusActorSchema>;

/** Append-only record of one moderation status change on an entry or a chain story. */
export const statusTransitionSchema = z.object({
  targetType: flagTargetTypeSchema,
  targetId: z.string().min(1).max(120),
  entryId: z.string().min(1).max(120),
  event: statusEventSchema,
  from: entryStatusSchema,
  to: entryStatusSchema,
  actor: statusActorSchema,
  at: z.coerce.date(),
});

export type StatusTransition = z.infer<typeof statusTransitionSchema>;
