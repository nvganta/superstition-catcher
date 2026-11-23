import type { AiNoteEvent, AiNoteStatus } from '@/lib/schema/aiNote';

/** Every allowed note change. An entry shows at most one published note, enforced by a partial unique index. */
export const AI_NOTE_TRANSITIONS: Record<AiNoteStatus, Partial<Record<AiNoteEvent, AiNoteStatus>>> = {
  draft: { publish: 'published', discard: 'archived' },
  published: { unpublish: 'archived' },
  archived: {},
};

export const EVENT_TIMESTAMP: Record<AiNoteEvent, 'publishedAt' | 'archivedAt'> = {
  publish: 'publishedAt',
  discard: 'archivedAt',
  unpublish: 'archivedAt',
};
