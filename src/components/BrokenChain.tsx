'use client';

import { useEffect, useState } from 'react';
import type { ChainView, MyChainAnswer } from '@/lib/chain/store';
import { chainOutcome, type ChainOutcome } from '@/lib/chain/tally';
import type { GenerationBand } from '@/lib/schema/chainEntry';
import type { EntryStatus, Region } from '@/lib/schema/common';
import type { FieldIssue } from '@/lib/entries/results';
import { GENERATION_BANDS, REGIONS, generationBandLabels, regionLabels } from '@/lib/entries/labels';
import { FIELD_LIMITS } from '@/lib/guardrails/limits';
import { ensureVisitorCookie } from '@/lib/visitorId';
import FlagButton from './FlagButton';

interface Draft {
  passedDown: boolean | null;
  kept: boolean | null;
  storyText: string;
  name: string;
  region: Region | '';
  generationBand: GenerationBand | '';
}

const OUTCOMES: Record<ChainOutcome, { label: string; hint: string }> = {
  keptIt: { label: 'Kept it', hint: 'Handed down, still followed' },
  droppedIt: { label: 'Let it go', hint: 'Handed down, stopped' },
  pickedItUp: { label: 'Picked it up', hint: 'Not handed down, follow it anyway' },
  neverHadIt: { label: 'Never had it', hint: 'Not handed down, do not follow it' },
};

const OUTCOME_ORDER = Object.keys(OUTCOMES) as ChainOutcome[];

const STORY_STATUS_NOTES: Record<Exclude<EntryStatus, 'live'>, string> = {
  flagged: 'Your story was reported and is waiting for an editor, so it does not show publicly. Your answer still counts.',
  underReview: 'An editor is reviewing your story, so it does not show publicly. Your answer still counts.',
  hidden: 'An editor hid your story from the page. Your answer still counts.',
  removed: 'An editor removed your story. Your answer still counts.',
};

const emptyDraft: Draft = { passedDown: null, kept: null, storyText: '', name: '', region: '', generationBand: '' };

function draftFrom(mine: MyChainAnswer | null): Draft {
  if (!mine) return emptyDraft;
  return {
    passedDown: mine.passedDown,
    kept: mine.kept,
    storyText: mine.storyText ?? '',
    name: mine.name ?? '',
    region: mine.region ?? '',
    generationBand: mine.generationBand ?? '',
  };
}

const inputClass =
  'w-full px-3 py-2 bg-cream border-2 border-ink/10 rounded-lg text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-amber';
const labelClass = 'block text-xs font-semibold text-ink/50 uppercase tracking-wider mb-1.5';

function YesNo({
  legend,
  value,
  onChange,
}: {
  legend: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-ink mb-2">{legend}</legend>
      <div className="flex gap-2">
        {[true, false].map((option) => (
          <button
            key={String(option)}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
              value === option ? 'bg-teal/15 border-teal text-ink' : 'bg-ink/5 border-transparent text-ink/60 hover:bg-ink/10'
            }`}
          >
            {option ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function BrokenChain({ entryId }: { entryId: string }) {
  const [view, setView] = useState<ChainView | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [issues, setIssues] = useState<FieldIssue[]>([]);

  useEffect(() => {
    ensureVisitorCookie();
    fetch(`/api/entries/${entryId}/chain`)
      .then((res) => (res.ok ? res.json() : null))
      .then((loaded: ChainView | null) => {
        setView(loaded);
        setDraft(draftFrom(loaded?.mine ?? null));
      })
      .catch(() => setView(null));
  }, [entryId]);

  function update(patch: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (draft.passedDown === null || draft.kept === null) return;
    setSaving(true);
    setMessage('');
    setIssues([]);
    try {
      ensureVisitorCookie();
      const res = await fetch(`/api/entries/${entryId}/chain`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (res.ok) {
        setView(data);
        setDraft(draftFrom(data.mine));
        setMessage(view?.mine ? 'Your answer is updated.' : 'Thanks. You are part of the chain now.');
      } else {
        setMessage(data.message ?? 'That did not save. Try again in a moment.');
        setIssues(data.issues ?? []);
      }
    } catch {
      setMessage('Could not reach the server.');
    } finally {
      setSaving(false);
    }
  }

  const total = view ? OUTCOME_ORDER.reduce((sum, key) => sum + view.tally[key], 0) : 0;
  const mine = view?.mine ?? null;

  return (
    <div className="space-y-6">
      <p className="text-ink/60 leading-relaxed">
        Every tradition travels hand to hand. Was this one handed to you, and did you keep it?
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" aria-label="How the chain is holding">
        {OUTCOME_ORDER.map((key) => (
          <div key={key} className="paper-card rounded-lg p-4 text-center">
            <div className="font-display text-2xl text-ink" data-tally={key}>
              {view ? view.tally[key] : '·'}
            </div>
            <div className="text-sm font-semibold text-ink/70">{OUTCOMES[key].label}</div>
            <div className="text-xs text-ink/40 mt-1">{OUTCOMES[key].hint}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-ink/40">
        {total === 0 ? 'Nobody has answered yet.' : `${total} ${total === 1 ? 'person has' : 'people have'} answered.`}
      </p>

      <form onSubmit={submit} className="paper-card rounded-xl p-5 space-y-4">
        <YesNo legend="Was this passed down to you?" value={draft.passedDown} onChange={(passedDown) => update({ passedDown })} />
        <YesNo legend="Do you keep it today?" value={draft.kept} onChange={(kept) => update({ kept })} />

        <label className="block">
          <span className={labelClass}>The story behind your answer (optional)</span>
          <textarea
            value={draft.storyText}
            onChange={(e) => update({ storyText: e.target.value })}
            maxLength={FIELD_LIMITS.chainText}
            rows={3}
            placeholder="Who taught you, and what made you keep it or drop it?"
            className={`${inputClass} resize-y`}
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="block">
            <span className={labelClass}>Name with your story (optional)</span>
            <input
              type="text"
              value={draft.name}
              maxLength={FIELD_LIMITS.postedBy}
              onChange={(e) => update({ name: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className={labelClass}>Where you grew up</span>
            <select value={draft.region} onChange={(e) => update({ region: e.target.value as Region | '' })} className={inputClass}>
              <option value="">Rather not say</option>
              {REGIONS.map((region) => (
                <option key={region} value={region}>
                  {regionLabels[region]}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>Generation</span>
            <select
              value={draft.generationBand}
              onChange={(e) => update({ generationBand: e.target.value as GenerationBand | '' })}
              className={inputClass}
            >
              <option value="">Rather not say</option>
              {GENERATION_BANDS.map((band) => (
                <option key={band} value={band}>
                  {generationBandLabels[band]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {mine?.storyText && mine.status !== 'live' && (
          <p className="text-sm text-amber-dark">{STORY_STATUS_NOTES[mine.status]}</p>
        )}
        {message && (
          <div className="text-sm" role="status">
            <p className={issues.length > 0 ? 'text-stamp-red' : 'text-teal-dark'}>{message}</p>
            {issues.length > 0 && (
              <ul className="list-disc pl-5 text-stamp-red">
                {issues.map((issue) => (
                  <li key={`${issue.field}-${issue.message}`}>{issue.message}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        <button
          type="submit"
          disabled={saving || draft.passedDown === null || draft.kept === null}
          className="px-5 py-2.5 bg-ink text-cream rounded-lg text-sm font-medium hover:bg-navy transition-colors disabled:opacity-40"
        >
          {saving ? 'Saving…' : mine ? 'Update my answer' : 'Add my answer'}
        </button>
      </form>

      {view && view.stories.length > 0 && (
        <ul className="space-y-3">
          {view.stories.map((story) => (
            <li key={story.id} className="paper-card rounded-lg p-4">
              <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
                <span className="font-semibold px-2 py-0.5 rounded-full bg-teal/15 text-ink">{OUTCOMES[chainOutcome(story.passedDown, story.kept)].label}</span>
                <span className="text-ink/60 font-semibold">{story.name ?? 'A visitor'}</span>
                {story.generationBand && <span className="text-ink/40">{generationBandLabels[story.generationBand]}</span>}
                {story.region && <span className="text-ink/40">{regionLabels[story.region]}</span>}
              </div>
              <p className="text-sm text-ink/70 leading-relaxed whitespace-pre-line mb-2">{story.text}</p>
              <FlagButton targetType="chainEntry" targetId={story.id} label="Report this story" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
