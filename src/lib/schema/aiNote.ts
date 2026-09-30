import { z } from 'zod';

/** AI-generated editorial note (Wave 3+). Stored now for schema stability. */
export const aiNoteKindSchema = z.enum([
  'summary',
  'sourceSuggestion',
  'editorialHint',
  'freshLookDraft',
]);

export type AiNoteKind = z.infer<typeof aiNoteKindSchema>;

export const aiNoteSchema = z.object({
  id: z.string().uuid(),
  entryId: z.string().min(1).max(120),
  kind: aiNoteKindSchema,
  content: z.string().min(1).max(10000),
  model: z.string().max(80).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
});

export type AiNote = z.infer<typeof aiNoteSchema>;
