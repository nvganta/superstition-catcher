import type { PublicAiNote } from '@/lib/aiNotes/store';

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Kept visibly apart from the entry's own sourced sections: dashed frame, its own label, no source styling. */
export default function AiContextNote({ note, entryVersion }: { note: PublicAiNote; entryVersion: number }) {
  return (
    <section
      aria-labelledby="ai-note-heading"
      data-testid="ai-context-note"
      className="rounded-xl border-2 border-dashed border-slate-blue/40 bg-slate-blue/5 p-6 sm:p-8"
    >
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-blue/15 text-slate-blue">
          AI-generated
        </span>
        <h2 id="ai-note-heading" className="font-display text-base tracking-tight text-ink">
          AI CONTEXT NOTE
        </h2>
      </div>
      <p className="text-ink/70 leading-relaxed whitespace-pre-line">{note.body}</p>
      <p className="text-ink/60 text-sm leading-relaxed mt-4">
        <span className="font-semibold text-ink/70">What is uncertain: </span>
        {note.uncertainty}
      </p>
      <p className="text-xs text-ink/40 mt-5 leading-relaxed">
        Written by an AI model ({note.model}) and published by an editor on {formatDate(note.publishedAt)}. It cites no
        sources and is not part of the entry&apos;s evidence.
        {note.entryVersion < entryVersion && ' It was written for an earlier version of this entry.'}
      </p>
    </section>
  );
}
