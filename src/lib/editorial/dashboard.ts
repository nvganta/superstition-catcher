import type { Db } from 'mongodb';
import { createAiNoteStore } from '@/lib/aiNotes/store';
import type { PublicEntry } from '@/lib/entries/documents';
import { createEntryStore } from '@/lib/entries/store';
import { shouldFlagWhyItStuckForReview } from '@/lib/migration/mapSuperstitionToEntry';
import { listModerationQueue } from '@/lib/moderation/queue';
import { mapLegacyCategoryToSlugs } from '@/lib/schema/categoryMapping';

export type EditorialCheckGroup = 'migration' | 'evidence';

interface EditorialCheck {
  id: string;
  group: EditorialCheckGroup;
  label: string;
  description: string;
  applies: (entry: PublicEntry) => boolean;
}

function sameSlugs(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((slug) => b.includes(slug));
}

/**
 * What the dashboard asks of every entry. The migration checks read the entry itself rather than
 * the migration report, so an entry leaves the list as soon as an editor fixes it.
 */
export const EDITORIAL_CHECKS: readonly EditorialCheck[] = [
  {
    id: 'whyItStuckFromLegacy',
    group: 'migration',
    label: '"Why it stuck" still explains the science',
    description:
      'The migration copied the old "real reason" into "why it stuck", and it reads as a practical explanation, not why the custom persisted.',
    applies: (entry) =>
      entry.legacy !== undefined &&
      entry.whyItStuck === entry.legacy.theRealReason &&
      shouldFlagWhyItStuckForReview(entry.legacy.theRealReason),
  },
  {
    id: 'categoriesFromLegacy',
    group: 'migration',
    label: 'Categories mapped automatically',
    description: 'Never edited since the migration mapped its one old category to the new life areas.',
    applies: (entry) =>
      entry.legacy !== undefined &&
      entry.version === 1 &&
      sameSlugs(entry.categorySlugs, mapLegacyCategoryToSlugs(entry.legacy.legacyCategory)),
  },
  {
    id: 'noSources',
    group: 'evidence',
    label: 'No sources',
    description: 'Nothing a reader can check.',
    applies: (entry) => entry.sources.length === 0,
  },
  {
    id: 'noConfidence',
    group: 'evidence',
    label: 'No confidence level',
    description: 'The editors have not said how sure the record is.',
    applies: (entry) => entry.confidence === undefined,
  },
];

export interface DashboardEntry {
  id: string;
  title: string;
  origin: PublicEntry['origin'];
  status: PublicEntry['status'];
  version: number;
}

export interface EditorialDashboard {
  checks: { id: string; group: EditorialCheckGroup; label: string; description: string; entries: DashboardEntry[] }[];
  noteDrafts: { noteId: string; entryId: string; entryTitle: string; model: string; createdAt: Date }[];
  moderation: { queued: number; openFlags: number };
}

export function editorialChecks(entries: PublicEntry[]): EditorialDashboard['checks'] {
  const candidates = entries.filter((entry) => entry.status !== 'removed');
  return EDITORIAL_CHECKS.map(({ applies, ...check }) => ({
    ...check,
    entries: candidates
      .filter(applies)
      .map(({ id, title, origin, status, version }) => ({ id, title, origin, status, version })),
  }));
}

export async function loadEditorialDashboard(db: Db): Promise<EditorialDashboard> {
  const [entries, drafts, queue] = await Promise.all([
    createEntryStore(db).listAllForAdmin(),
    createAiNoteStore(db, null).listDrafts(),
    listModerationQueue(db),
  ]);
  const titles = new Map(entries.map((entry) => [entry.id, entry.title]));

  return {
    checks: editorialChecks(entries),
    noteDrafts: drafts.map((note) => ({
      noteId: note.id,
      entryId: note.entryId,
      entryTitle: titles.get(note.entryId) ?? note.entryId,
      model: note.model,
      createdAt: note.createdAt,
    })),
    moderation: {
      queued: queue.length,
      openFlags: queue.reduce((sum, item) => sum + item.openFlags.length, 0),
    },
  };
}
