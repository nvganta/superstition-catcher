'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { ReactionView } from '@/lib/reactions/store';
import { RATING_MAX } from '@/lib/schema/reaction';
import { ensureVisitorCookie } from '@/lib/visitorId';

type Change = { kind: 'rate'; value: number | null } | { kind: 'save' | 'hide'; value: boolean };

const STARS = Array.from({ length: RATING_MAX }, (_, index) => index + 1);

export default function EntryReactions({ entryId }: { entryId: string }) {
  const [view, setView] = useState<ReactionView | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    ensureVisitorCookie();
    fetch(`/api/entries/${entryId}/reactions`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setView)
      .catch(() => setView(null));
  }, [entryId]);

  async function change(next: Change) {
    if (pending) return;
    setPending(true);
    setError('');
    try {
      ensureVisitorCookie();
      const res = await fetch(`/api/entries/${entryId}/reactions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
      if (res.ok) {
        setView(await res.json());
      } else {
        setError('That did not save. Try again in a moment.');
      }
    } catch {
      setError('Could not reach the server.');
    } finally {
      setPending(false);
    }
  }

  const mine = view?.mine;

  return (
    <div className="space-y-5">
      <div className="paper-card rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-ink/50 uppercase tracking-wider mb-2">Worth the fresh look?</p>
            <div className="flex items-center gap-1" role="radiogroup" aria-label="Rate this entry">
              {STARS.map((star) => {
                const filled = (mine?.rating ?? 0) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    role="radio"
                    aria-checked={mine?.rating === star}
                    aria-label={`${star} of ${RATING_MAX}`}
                    disabled={pending}
                    onClick={() => change({ kind: 'rate', value: mine?.rating === star ? null : star })}
                    className={`text-2xl leading-none transition-transform hover:scale-110 disabled:opacity-50 ${
                      filled ? 'text-amber' : 'text-ink/15'
                    }`}
                  >
                    ★
                  </button>
                );
              })}
            </div>
          </div>
          <p className="text-sm text-ink/50" aria-live="polite">
            {view && view.rating.count > 0
              ? `${view.rating.average} average from ${view.rating.count} ${view.rating.count === 1 ? 'rating' : 'ratings'}`
              : 'No ratings yet'}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          aria-pressed={mine?.saved ?? false}
          disabled={pending}
          onClick={() => change({ kind: 'save', value: !mine?.saved })}
          className={`px-4 py-2.5 rounded-lg text-sm font-medium border-2 transition-all disabled:opacity-50 ${
            mine?.saved ? 'bg-teal/15 border-teal text-ink' : 'bg-ink/5 border-transparent text-ink/60 hover:bg-ink/10'
          }`}
        >
          {mine?.saved ? '🔖 Saved' : '🔖 Save for later'}
        </button>
        <button
          type="button"
          aria-pressed={mine?.hidden ?? false}
          disabled={pending}
          onClick={() => change({ kind: 'hide', value: !mine?.hidden })}
          className={`px-4 py-2.5 rounded-lg text-sm font-medium border-2 transition-all disabled:opacity-50 ${
            mine?.hidden ? 'bg-ink/10 border-ink/30 text-ink' : 'bg-ink/5 border-transparent text-ink/60 hover:bg-ink/10'
          }`}
        >
          {mine?.hidden ? '🙈 Hidden from your feeds' : '🙈 Hide from my feeds'}
        </button>
        {(mine?.saved || mine?.hidden) && (
          <Link href="/saved" className="text-sm font-semibold text-coral hover:underline">
            Your saved list →
          </Link>
        )}
      </div>
      {error && <p className="text-sm text-stamp-red">{error}</p>}
    </div>
  );
}
