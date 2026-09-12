'use client';

import { useState, useEffect, useCallback } from 'react';
import { getVisitorId } from '@/lib/visitorId';
import {
  emptyTally,
  limits,
  stanceColors,
  stanceEmojis,
  stanceLabels,
  stancePrompts,
  stances,
  tallyPercent,
  tallyTotal,
  type ChainEntry,
  type Stance,
  type StanceTally,
} from '@/data/brokenChain';

export default function BrokenChain({ superstitionId }: { superstitionId: string }) {
  const [entries, setEntries] = useState<ChainEntry[]>([]);
  const [tally, setTally] = useState<StanceTally>(emptyTally);
  const [stance, setStance] = useState<Stance | null>(null);
  const [name, setName] = useState('');
  const [whoDidIt, setWhoDidIt] = useState('');
  const [whatChanged, setWhatChanged] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchChain = useCallback(async () => {
    try {
      const res = await fetch(`/api/chain?superstitionId=${superstitionId}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
        setTally({ ...emptyTally, ...(data.tally || {}) });
      }
    } catch (err) {
      console.error('Failed to fetch chain entries:', err);
    }
  }, [superstitionId]);

  useEffect(() => {
    fetchChain();
  }, [fetchChain]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stance || !whatChanged.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/chain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          superstitionId,
          visitorId: getVisitorId(),
          stance,
          name: name.trim(),
          whoDidIt: whoDidIt.trim(),
          whatChanged: whatChanged.trim(),
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setStance(null);
        setWhoDidIt('');
        setWhatChanged('');
        fetchChain();
      }
    } catch (err) {
      console.error('Failed to post chain entry:', err);
    } finally {
      setSubmitting(false);
    }
  }

  const total = tallyTotal(tally);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-xl">⛓️</span>
        <h2 className="font-display text-base tracking-tight text-ink">THE BROKEN CHAIN</h2>
        <div className="flex-grow h-px bg-ink/10" />
      </div>
      <p className="text-sm text-ink/40 leading-relaxed mb-6 max-w-2xl">
        Traditions rarely die outright. They get quietly rewritten by whoever inherits them.
        Tell us what happened to this one in your family.
      </p>

      {/* Stance bar */}
      {total > 0 && (
        <div className="paper-card rounded-xl p-5 mb-5">
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-[10px] font-semibold text-ink/40 uppercase tracking-wider">
              Where this one stands
            </span>
            <span className="text-xs text-ink/30">
              {total} {total === 1 ? 'family' : 'families'}
            </span>
          </div>

          <div className="flex h-3 rounded-full overflow-hidden bg-ink/5 mb-4">
            {stances.map((s) =>
              tally[s] > 0 ? (
                <div
                  key={s}
                  className={`${stanceColors[s].bar} transition-all duration-500`}
                  style={{ width: `${tallyPercent(tally, s)}%` }}
                  title={`${stanceLabels[s]}: ${tally[s]}`}
                />
              ) : null
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stances.map((s) => (
              <div key={s} className="flex items-start gap-2">
                <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${stanceColors[s].dot}`} />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-ink leading-none mb-1">
                    {tallyPercent(tally, s)}%
                  </div>
                  <div className="text-[11px] text-ink/40 leading-snug">{stanceLabels[s]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form */}
      {submitted ? (
        <div className="paper-card rounded-xl p-6 mb-5 text-center">
          <div className="text-3xl mb-2">📩</div>
          <p className="font-display text-sm text-ink mb-1">STORY RECEIVED</p>
          <p className="text-xs text-ink/40 max-w-sm mx-auto leading-relaxed">
            Your answer already counts in the bar above. The story itself gets read by a human
            before it goes up, because these get personal and they deserve that.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-4 text-xs font-semibold text-coral hover:text-coral-dark transition-colors"
          >
            Change my answer
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="paper-card rounded-xl p-5 mb-6">
          <div className="text-[10px] font-semibold text-ink/40 uppercase tracking-wider mb-3">
            In your family, this one is...
          </div>

          {/* Stance picker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {stances.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStance(s)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border-2 text-left transition-all ${
                  stance === s
                    ? `border-ink/25 ${stanceColors[s].tint}`
                    : 'border-ink/8 bg-cream hover:border-ink/15'
                }`}
              >
                <span className="text-base shrink-0">{stanceEmojis[s]}</span>
                <span className="text-xs font-semibold text-ink leading-snug">
                  {stanceLabels[s]}
                </span>
              </button>
            ))}
          </div>

          {/* The story, revealed only after a stance is picked, so the question
              they answer is always the one matched to their situation. */}
          {stance && (
            <div className="space-y-3 animate-in">
              <div>
                <label className="block text-[10px] font-semibold text-ink/40 mb-1 uppercase tracking-wider">
                  Who in your family did it?
                </label>
                <input
                  type="text"
                  value={whoDidIt}
                  onChange={(e) => setWhoDidIt(e.target.value)}
                  placeholder="e.g. my grandmother, in Coimbatore, every Friday"
                  maxLength={limits.whoDidIt}
                  className="w-full px-3 py-2 bg-cream border-2 border-ink/8 rounded-lg text-sm text-ink placeholder:text-ink/25 focus:outline-none focus:border-amber transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-ink/40 mb-1 uppercase tracking-wider">
                  {stancePrompts[stance]}
                </label>
                <textarea
                  value={whatChanged}
                  onChange={(e) => setWhatChanged(e.target.value)}
                  maxLength={limits.whatChanged}
                  rows={3}
                  required
                  className="w-full px-3 py-2 bg-cream border-2 border-ink/8 rounded-lg text-sm text-ink placeholder:text-ink/25 focus:outline-none focus:border-amber transition-colors resize-none"
                />
                <div className="text-right text-[10px] text-ink/20 mt-0.5">
                  {whatChanged.length}/{limits.whatChanged}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  maxLength={limits.name}
                  className="flex-grow px-3 py-2 bg-cream border-2 border-ink/8 rounded-lg text-xs text-ink placeholder:text-ink/25 focus:outline-none focus:border-amber transition-colors"
                />
                <button
                  type="submit"
                  disabled={submitting || !whatChanged.trim()}
                  className="px-5 py-2 bg-ink text-cream rounded-lg text-xs font-semibold hover:bg-navy transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  {submitting ? 'Sending...' : 'Add my link'}
                </button>
              </div>
            </div>
          )}
        </form>
      )}

      {/* Stories */}
      {entries.length > 0 ? (
        <div className="space-y-3">
          {entries.map((entry, i) => (
            <div
              key={entry._id || i}
              className={`rounded-lg p-4 border-2 border-ink/8 ${stanceColors[entry.stance].tint}`}
            >
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-sm">{stanceEmojis[entry.stance]}</span>
                <span className="text-[11px] font-semibold text-ink/60 uppercase tracking-wide">
                  {stanceLabels[entry.stance]}
                </span>
                {entry.whoDidIt && (
                  <>
                    <span className="text-ink/15">·</span>
                    <span className="text-[11px] text-ink/40 italic">{entry.whoDidIt}</span>
                  </>
                )}
              </div>
              <p className="text-sm text-ink/70 leading-relaxed">{entry.whatChanged}</p>
              <div className="text-[11px] text-ink/30 mt-2">— {entry.name}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-2xl mb-2">⛓️‍💥</div>
          <p className="text-sm text-ink/40">
            No stories yet. Be the first link in this chain.
          </p>
        </div>
      )}
    </div>
  );
}
