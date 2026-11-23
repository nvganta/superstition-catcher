import { z } from 'zod';

/**
 * A short AI-written context note on an entry. It is a draft until an admin publishes it, and an
 * entry shows at most one published note. Archived notes were discarded or replaced.
 */
export const aiNoteStatusSchema = z.enum(['draft', 'published', 'archived']);

export type AiNoteStatus = z.infer<typeof aiNoteStatusSchema>;

export const aiNoteEventSchema = z.enum(['publish', 'discard', 'unpublish']);

export type AiNoteEvent = z.infer<typeof aiNoteEventSchema>;

const AI_NOTE_LIMITS = { body: 2000, uncertainty: 600 } as const;

const aiNoteBaseSchema = z.object({
  id: z.string().uuid(),
  entryId: z.string().min(1).max(120),
  /** The entry version the note was written from, so a later edit can mark it stale. */
  entryVersion: z.number().int().positive(),
  body: z.string().min(1).max(AI_NOTE_LIMITS.body),
  /** What the model is unsure of. Required, since the note cites nothing. */
  uncertainty: z.string().min(1).max(AI_NOTE_LIMITS.uncertainty),
  model: z.string().min(1).max(80),
  promptVersion: z.string().min(1).max(40),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const aiNoteSchema = z.discriminatedUnion('status', [
  aiNoteBaseSchema.extend({ status: z.literal('draft') }),
  aiNoteBaseSchema.extend({ status: z.literal('published'), publishedAt: z.coerce.date() }),
  aiNoteBaseSchema.extend({
    status: z.literal('archived'),
    archivedAt: z.coerce.date(),
    publishedAt: z.coerce.date().optional(),
  }),
]);

export type AiNote = z.infer<typeof aiNoteSchema>;
