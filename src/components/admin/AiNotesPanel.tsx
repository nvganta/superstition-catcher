'use client';

import { useCallback, useEffect, useState } from 'react';
import { AI_NOTE_TRANSITIONS } from '@/lib/aiNotes/lifecycle';
import type { AiNote, AiNoteEvent, AiNoteStatus } from '@/lib/schema/aiNote';

type AdminNote = Omit<AiNote, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string };

const STATUS_LABELS: Record<AiNoteStatus, string> = {
  draft: 'Draft, not public',
  published: 'Published',
  archived: 'Archived',
};

const EVENT_LABELS: Record<AiNoteEvent, string> = {
  publish: 'Publish on the entry page',
  discard: 'Discard draft',
  unpublish: 'Unpublish',
};

const EVENT_STYLES: Record<AiNoteEvent, string> = {
  publish: 'bg-teal/15 text-teal-dark hover:bg-teal/25',
  discard: 'bg-ink/5 text-ink/70 hover:bg-ink/10',
  unpublish: 'bg-amber/10 text-amber-dark hover:bg-amber/20',
};

export default function AiNotesPanel({
  password,
  entryId,
  entryVersion,
}: {
  password: string;
  entryId: string;
  entryVersion: number;
}) {
  const [notes, setNotes] = useState<AdminNote[] | null>(null);
  const [configured, setConfigured] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/entries/${entryId}/notes`, { headers: { 'x-admin-password': password } });
    if (!res.ok) {
      setMessage('Could not load AI notes.');
      return;
    }
    const data = await res.json();
    setConfigured(data.configured);
    setNotes(data.notes);
  }, [entryId, password]);

  useEffect(() => {
    load();
  }, [load]);

  async function run(request: Promise<Response>, success: string) {
    setBusy(true);
    setMessage('');
    try {
      const res = await request;
      const data = await res.json();
      setMessage(res.ok ? success : data.message ?? 'That did not go through.');
      await load();
    } catch {
      setMessage('Could not reach the server.');
    } finally {
      setBusy(false);
    }
  }

  function generate() {
    run(
      fetch(`/api/admin/entries/${entryId}/notes`, { method: 'POST', headers: { 'x-admin-password': password } }),
      'Draft generated. Read it before publishing.'
    );
  }

  function apply(note: AdminNote, event: AiNoteEvent) {
    run(
      fetch(`/api/admin/notes/${note.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ event }),
      }),
      event === 'publish' ? 'Published. It now shows on the entry page, labelled as AI-generated.' : 'Note updated.'
    );
  }

  return (
    <section className="paper-card rounded-lg p-4 mb-8 space-y-4" aria-labelledby="ai-notes-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="ai-notes-heading" className="font-display text-lg text-ink">
            AI context note
          </h2>
          <p className="text-xs text-ink/50">
            Drafts stay private until you publish one. A published note shows on the entry page, labelled as AI-generated.
          </p>
        </div>
        <button
          type="button"
          onClick={generate}
          disabled={busy || !configured}
          className="px-4 py-2 bg-slate-blue/15 text-slate-blue rounded-lg text-sm font-medium hover:bg-slate-blue/25 transition-colors disabled:opacity-50"
        >
          {busy ? 'Working…' : 'Generate a draft'}
        </button>
      </div>

      {!configured && (
        <p className="text-sm text-amber-dark" role="status">
          AI notes are not configured. Set ANTHROPIC_API_KEY to turn them on.
        </p>
      )}
      {message && (
        <p className="text-sm text-amber-dark font-medium" role="status">
          {message}
        </p>
      )}

      {notes && notes.length > 0 && (
        <ul className="space-y-3">
          {notes.map((note) => {
            const events = Object.keys(AI_NOTE_TRANSITIONS[note.status]) as AiNoteEvent[];
            return (
              <li
                key={note.id}
                data-note-status={note.status}
                className="rounded-lg border-2 border-dashed border-slate-blue/30 bg-slate-blue/5 p-4 space-y-2"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold px-2 py-0.5 rounded-full bg-slate-blue/15 text-slate-blue">
                    {STATUS_LABELS[note.status]}
                  </span>
                  <span className="text-ink/40">
                    {note.model} · {note.promptVersion} · written from v{note.entryVersion}
                    {note.entryVersion < entryVersion ? ' (entry changed since)' : ''} ·{' '}
                    {new Date(note.createdAt).toLocaleString('en-GB')}
                  </span>
                </div>
                <p className="text-sm text-ink/80 leading-relaxed whitespace-pre-line">{note.body}</p>
                <p className="text-sm text-ink/60">
                  <span className="font-semibold">Uncertain: </span>
                  {note.uncertainty}
                </p>
                {events.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {events.map((event) => (
                      <button
                        key={event}
                        type="button"
                        disabled={busy}
                        onClick={() => apply(note, event)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-50 ${EVENT_STYLES[event]}`}
                      >
                        {EVENT_LABELS[event]}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
