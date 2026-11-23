import type { AiNoteEvent, AiNoteStatus } from '@/lib/schema/aiNote';

/** Every allowed note change. Publishing a note archives the entry's earlier published note. */
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
