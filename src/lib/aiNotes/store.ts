import type { Db, Document } from 'mongodb';
import { createEntryStore } from '@/lib/entries/store';
import { isDuplicateKeyError } from '@/lib/entries/documents';
import { getDb } from '@/lib/mongodb';
import { aiNoteSchema, type AiNote, type AiNoteEvent } from '@/lib/schema/aiNote';
import { AiNoteProviderError } from './anthropic';
import { AI_NOTE_TRANSITIONS, EVENT_TIMESTAMP } from './lifecycle';
import { resolveAiNoteProvider, type AiNoteProvider } from './provider';

export type GenerateNoteResult =
  | { kind: 'created'; note: AiNote }
  | { kind: 'notConfigured' }
  | { kind: 'notFound' }
  | { kind: 'failed'; message: string };

export type NoteEventResult =
  | { kind: 'changed'; note: AiNote }
  | { kind: 'notFound' }
  | { kind: 'refused'; message: string };

export type PublicAiNote = Pick<AiNote, 'body' | 'uncertainty' | 'model' | 'entryVersion'> & { publishedAt: Date };

function parseNoteDocs(docs: Document[]): AiNote[] {
  return docs.flatMap((doc) => {
    const parsed = aiNoteSchema.safeParse(doc);
    if (parsed.success) return [parsed.data];
    console.error(`aiNotes: skipping invalid document "${String(doc.id)}"`, parsed.error.issues);
    return [];
  });
}

export function createAiNoteStore(db: Db, provider: AiNoteProvider | null) {
  const notes = db.collection('aiNotes');
  const entryStore = createEntryStore(db);

  async function findNote(id: string): Promise<AiNote | null> {
    const doc = await notes.findOne({ id });
    return doc ? (parseNoteDocs([doc])[0] ?? null) : null;
  }

  return {
    configured: provider !== null,

    async generate(entryId: string, now = new Date()): Promise<GenerateNoteResult> {
      if (!provider) return { kind: 'notConfigured' };
      const entry = await entryStore.getForAdmin(entryId);
      if (!entry || entry.status === 'removed') return { kind: 'notFound' };

      let drafted;
      try {
        drafted = await provider.draft(entry);
      } catch (error) {
        console.error(`aiNotes: drafting a note for "${entryId}" failed`, error);
        return {
          kind: 'failed',
          message: error instanceof AiNoteProviderError ? error.message : 'The note could not be generated. Try again later.',
        };
      }

      const parsed = aiNoteSchema.safeParse({
        id: crypto.randomUUID(),
        entryId,
        entryVersion: entry.version,
        body: drafted.body,
        uncertainty: drafted.uncertainty,
        model: drafted.model,
        promptVersion: provider.promptVersion,
        status: 'draft',
        createdAt: now,
        updatedAt: now,
      });
      if (!parsed.success) {
        console.error(`aiNotes: the drafted note for "${entryId}" was not usable`, parsed.error.issues);
        return { kind: 'failed', message: 'The model returned a note that was empty or too long. Try again.' };
      }
      await notes.insertOne({ ...parsed.data });
      return { kind: 'created', note: parsed.data };
    },

    async listForEntry(entryId: string): Promise<AiNote[]> {
      return parseNoteDocs(await notes.find({ entryId }).sort({ createdAt: -1 }).toArray());
    },

    async listDrafts(): Promise<AiNote[]> {
      return parseNoteDocs(await notes.find({ status: 'draft' }).sort({ createdAt: -1 }).toArray());
    },

    async apply(noteId: string, event: AiNoteEvent, now = new Date()): Promise<NoteEventResult> {
      const note = await findNote(noteId);
      if (!note) return { kind: 'notFound' };
      const to = AI_NOTE_TRANSITIONS[note.status][event];
      if (!to) return { kind: 'refused', message: `A ${note.status} note cannot be changed that way.` };

      if (event === 'publish') {
        await notes.updateMany(
          { entryId: note.entryId, status: 'published' },
          { $set: { status: 'archived', archivedAt: now, updatedAt: now } }
        );
      }

      try {
        const updated = await notes.findOneAndUpdate(
          { id: noteId, status: note.status },
          { $set: { status: to, [EVENT_TIMESTAMP[event]]: now, updatedAt: now } },
          { returnDocument: 'after' }
        );
        const [changed] = updated ? parseNoteDocs([updated]) : [];
        return changed
          ? { kind: 'changed', note: changed }
          : { kind: 'refused', message: 'This note changed in the meantime. Reload and try again.' };
      } catch (error) {
        if (isDuplicateKeyError(error)) {
          return { kind: 'refused', message: 'Another note on this entry was published at the same time. Reload and try again.' };
        }
        throw error;
      }
    },

    async publishedFor(entryId: string): Promise<PublicAiNote | null> {
      const [note] = parseNoteDocs(await notes.find({ entryId, status: 'published' }).limit(1).toArray());
      if (!note || note.status !== 'published') return null;
      const { body, uncertainty, model, entryVersion, publishedAt } = note;
      return { body, uncertainty, model, entryVersion, publishedAt };
    },
  };
}

export type AiNoteStore = ReturnType<typeof createAiNoteStore>;

export async function getAiNoteStore(): Promise<AiNoteStore> {
  return createAiNoteStore(await getDb(), resolveAiNoteProvider());
}

/** For public pages, which only read published notes and never need a provider. */
export async function getPublishedAiNote(entryId: string): Promise<PublicAiNote | null> {
  return createAiNoteStore(await getDb(), null).publishedFor(entryId);
}
