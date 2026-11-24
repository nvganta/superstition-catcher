'use client';

import { useState } from 'react';
import type { FlagReason, FlagTargetType } from '@/lib/schema/flag';
import { FLAG_REASONS, flagReasonLabels } from '@/lib/entries/labels';
import { FIELD_LIMITS } from '@/lib/guardrails/limits';
import { ensureVisitorCookie } from '@/lib/visitorId';

type Phase = 'closed' | 'open' | 'sending' | 'sent' | 'alreadySent';

export default function FlagButton({
  targetType,
  targetId,
  label,
}: {
  targetType: FlagTargetType;
  targetId: string;
  label: string;
}) {
  const [phase, setPhase] = useState<Phase>('closed');
  const [reason, setReason] = useState<FlagReason>('inaccurate');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPhase('sending');
    setError('');
    try {
      ensureVisitorCookie();
      const res = await fetch('/api/flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetType, targetId, reason, note }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setPhase(data.alreadyFlagged ? 'alreadySent' : 'sent');
        return;
      }
      setError(data.issues?.[0]?.message ?? data.message ?? 'That did not go through. Try again in a moment.');
      setPhase('open');
    } catch {
      setError('Could not reach the server.');
      setPhase('open');
    }
  }

  if (phase === 'sent' || phase === 'alreadySent') {
    return (
      <p className="text-xs text-ink/50" role="status">
        {phase === 'sent' ? 'Thanks. An editor will take a look.' : 'You already reported this. An editor will take a look.'}
      </p>
    );
  }

  if (phase === 'closed') {
    return (
      <button
        type="button"
        onClick={() => setPhase('open')}
        className="text-xs font-medium text-ink/40 hover:text-stamp-red transition-colors"
      >
        {label}
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="paper-card rounded-lg p-4 space-y-3 text-left w-full">
      <fieldset>
        <legend className="text-xs font-semibold text-ink/50 uppercase tracking-wider mb-2">What is wrong?</legend>
        <div className="space-y-1.5">
          {FLAG_REASONS.map((option) => (
            <label key={option} className="flex items-center gap-2 text-sm text-ink/70">
              <input
                type="radio"
                name={`flag-reason-${targetId}`}
                value={option}
                checked={reason === option}
                onChange={() => setReason(option)}
              />
              {flagReasonLabels[option]}
            </label>
          ))}
        </div>
      </fieldset>
      <label className="block">
        <span className="text-xs font-semibold text-ink/50 uppercase tracking-wider">Anything the editors should know? (optional)</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={FIELD_LIMITS.flagNote}
          rows={2}
          className="mt-1.5 w-full px-3 py-2 bg-cream border-2 border-ink/10 rounded-lg text-sm text-ink focus:outline-none focus:border-amber resize-none"
        />
      </label>
      {error && <p className="text-sm text-stamp-red">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={phase === 'sending'}
          className="px-4 py-2 bg-ink text-cream rounded-lg text-sm font-medium hover:bg-navy transition-colors disabled:opacity-50"
        >
          {phase === 'sending' ? 'Sending…' : 'Send report'}
        </button>
        <button type="button" onClick={() => setPhase('closed')} className="text-sm text-ink/40 hover:text-ink">
          Cancel
        </button>
      </div>
    </form>
  );
}
