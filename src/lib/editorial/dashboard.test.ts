import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { migrateEntries } from '../../../scripts/migrate-entries';
import { createAiNoteStore } from '@/lib/aiNotes/store';
import { stubNoteProvider } from '@/lib/aiNotes/provider';
import { createEntryStore } from '@/lib/entries/store';
import { flagTarget } from '@/lib/moderation/flags';
import { applyStatusEvent } from '@/lib/moderation/transitions';
import { CURATED_ENTRY, postTestEntry } from '@/test/fixtures';
import { startTestMongo, type TestMongo } from '@/test/mongoServer';
import { loadEditorialDashboard, type EditorialDashboard } from './dashboard';

let mongo: TestMongo;

function idsFor(dashboard: EditorialDashboard, checkId: string): string[] {
  const check = dashboard.checks.find((candidate) => candidate.id === checkId);
  if (!check) throw new Error(`no check ${checkId}`);
  return check.entries.map((entry) => entry.id).sort();
}

beforeAll(async () => {
  mongo = await startTestMongo({ migrate: true });
});

afterAll(async () => {
  await mongo.stop();
});

describe('editorial dashboard', () => {
  it('lists the entries the migration report flagged for review', async () => {
    const report = await migrateEntries(mongo.db, { dryRun: true });
    const flagged = report.editorialFlags.map((flag) => flag.entryId).sort();
    expect(flagged.length).toBeGreaterThan(0);

    const dashboard = await loadEditorialDashboard(mongo.db);
    expect(idsFor(dashboard, 'whyItStuckFromLegacy')).toEqual(flagged);
    expect(idsFor(dashboard, 'categoriesFromLegacy')).toHaveLength(report.mergedCount);
    expect(idsFor(dashboard, 'noSources')).toHaveLength(report.mergedCount);
  });

  it('drops an entry from the migration checks once an editor fixes it', async () => {
    const report = await migrateEntries(mongo.db, { dryRun: true });
    const [target] = report.editorialFlags;
    const store = createEntryStore(mongo.db);
    const entry = await store.getForAdmin(target.entryId);
    if (!entry) throw new Error('missing entry');

    const saved = await store.update(entry.id, {
      ...entry,
      whyItStuck: 'Families kept it because elders expected it at every new home.',
      sources: [{ title: 'Interviews with three households', kind: 'oral' }],
      version: entry.version,
    });
    expect(saved.kind).toBe('saved');

    const dashboard = await loadEditorialDashboard(mongo.db);
    expect(idsFor(dashboard, 'whyItStuckFromLegacy')).not.toContain(entry.id);
    expect(idsFor(dashboard, 'categoriesFromLegacy')).not.toContain(entry.id);
    expect(idsFor(dashboard, 'noSources')).not.toContain(entry.id);
  });

  it('puts community posts under the evidence gaps and leaves removed entries out', async () => {
    const community = await postTestEntry(mongo.db);
    const removed = await postTestEntry(mongo.db);
    await applyStatusEvent(mongo.db, { targetType: 'entry', targetId: removed }, 'remove', 'admin');

    const dashboard = await loadEditorialDashboard(mongo.db);
    expect(idsFor(dashboard, 'noSources')).toContain(community);
    expect(idsFor(dashboard, 'noConfidence')).toContain(community);
    expect(idsFor(dashboard, 'categoriesFromLegacy')).not.toContain(community);
    for (const check of dashboard.checks) {
      expect(check.entries.map((entry) => entry.id)).not.toContain(removed);
    }
  });

  it('lists AI note drafts awaiting review, not published ones, and counts the moderation queue', async () => {
    const notes = createAiNoteStore(mongo.db, stubNoteProvider);
    const draft = await notes.generate(CURATED_ENTRY);
    const toPublish = await notes.generate(CURATED_ENTRY);
    if (draft.kind !== 'created' || toPublish.kind !== 'created') throw new Error('generate failed');
    await notes.apply(toPublish.note.id, 'publish');

    const reported = await postTestEntry(mongo.db);
    await flagTarget(mongo.db, { visitorId: crypto.randomUUID(), targetType: 'entry', targetId: reported, reason: 'inaccurate' });

    const dashboard = await loadEditorialDashboard(mongo.db);
    expect(dashboard.noteDrafts.map((note) => note.noteId)).toEqual([draft.note.id]);
    expect(dashboard.noteDrafts[0].entryTitle).not.toBe(CURATED_ENTRY);
    expect(dashboard.moderation).toEqual({ queued: 1, openFlags: 1 });
  });
});
