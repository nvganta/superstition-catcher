'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Category } from '@/lib/schema/category';
import type { Region, SourceKind } from '@/lib/schema/common';
import type { FieldIssue } from '@/lib/entries/results';
import { REGIONS, categoryEmoji, regionLabels, sourceKindLabels } from '@/lib/entries/labels';
import { ensureVisitorCookie } from '@/lib/visitorId';

const MAX_CATEGORIES = 3;

const FIELD_LABELS: Record<string, string> = {
  title: 'Name of the tradition',
  country: 'Country',
  countryFlag: 'Flag',
  region: 'Region',
  categorySlugs: 'Categories',
  theDefault: 'The default',
  whyItStarted: 'Why it started',
  whyItStuck: 'Why it stuck',
  whatsChangedSince: "What's changed since",
  freshLook: 'A fresh look',
  postedBy: 'Your name',
  sourceTitles: 'Where you learned it',
  'sources.0.title': 'Source title',
  'sources.0.url': 'Source link',
};

const NARRATIVE_FIELDS = [
  {
    name: 'theDefault',
    label: 'The default',
    hint: 'What were you told to do, or never do? Say it the way it was said to you.',
    required: true,
  },
  {
    name: 'whyItStarted',
    label: 'Why it started',
    hint: 'Where do you think it came from? A best guess is fine, just say it is a guess.',
    required: true,
  },
  {
    name: 'whyItStuck',
    label: 'Why it stuck',
    hint: 'Why do people still follow it? Habit, fear, family, faith?',
    required: true,
  },
  {
    name: 'whatsChangedSince',
    label: "What's changed since",
    hint: 'How do people treat it today? Who still does it, who quietly stopped?',
    required: true,
  },
  {
    name: 'freshLook',
    label: 'A fresh look (optional)',
    hint: 'If you were deciding from scratch today, what would you keep?',
    required: false,
  },
] as const;

type Draft = {
  title: string;
  country: string;
  countryFlag: string;
  region: Region;
  categorySlugs: string[];
  theDefault: string;
  whyItStarted: string;
  whyItStuck: string;
  whatsChangedSince: string;
  freshLook: string;
  postedBy: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceKind: SourceKind;
};

const emptyDraft: Draft = {
  title: '',
  country: '',
  countryFlag: '',
  region: 'india',
  categorySlugs: [],
  theDefault: '',
  whyItStarted: '',
  whyItStuck: '',
  whatsChangedSince: '',
  freshLook: '',
  postedBy: '',
  sourceTitle: '',
  sourceUrl: '',
  sourceKind: 'oral',
};

interface Feedback {
  message: string;
  issues: FieldIssue[];
}

const inputClass =
  'w-full px-4 py-2.5 bg-cream border-2 border-ink/10 rounded-lg text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-amber transition-colors';
const labelClass = 'block text-xs font-semibold text-ink/50 mb-1.5 uppercase tracking-wider';

export default function PostEntryForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function toggleCategory(slug: string) {
    setDraft((current) => {
      const selected = current.categorySlugs.includes(slug)
        ? current.categorySlugs.filter((candidate) => candidate !== slug)
        : [...current.categorySlugs, slug].slice(0, MAX_CATEGORIES);
      return { ...current, categorySlugs: selected };
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setFeedback(null);

    const { sourceTitle, sourceUrl, sourceKind, ...fields } = draft;
    const sources = sourceTitle.trim() ? [{ title: sourceTitle, url: sourceUrl, kind: sourceKind }] : [];

    try {
      ensureVisitorCookie();
      const res = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...fields, sources }),
      });
      const data = await res.json();

      if (res.status === 201) {
        router.push(`/superstition/${data.entry.id}`);
        return;
      }
      setFeedback({
        message: data.message ?? 'Something went wrong. Please try again.',
        issues: data.issues ?? [],
      });
    } catch {
      setFeedback({ message: 'Could not reach the server. Check your connection and try again.', issues: [] });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="title" className={labelClass}>
            Name of the tradition *
          </label>
          <input
            id="title"
            value={draft.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="e.g. Never cut your nails after sunset"
            maxLength={200}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="country" className={labelClass}>
            Country *
          </label>
          <input
            id="country"
            value={draft.country}
            onChange={(e) => update('country', e.target.value)}
            placeholder="e.g. India"
            maxLength={80}
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-[1fr_5rem] gap-3">
          <div>
            <label htmlFor="region" className={labelClass}>
              Region *
            </label>
            <select
              id="region"
              value={draft.region}
              onChange={(e) => update('region', e.target.value as Region)}
              className={inputClass}
            >
              {REGIONS.map((region) => (
                <option key={region} value={region}>
                  {regionLabels[region]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="countryFlag" className={labelClass}>
              Flag
            </label>
            <input
              id="countryFlag"
              value={draft.countryFlag}
              onChange={(e) => update('countryFlag', e.target.value)}
              placeholder="🇮🇳"
              maxLength={8}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      <fieldset>
        <legend className={labelClass}>Categories * (up to {MAX_CATEGORIES})</legend>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const selected = draft.categorySlugs.includes(category.slug);
            return (
              <button
                key={category.slug}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleCategory(category.slug)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selected ? 'bg-ink text-cream shadow-md' : 'bg-ink/5 text-ink/60 hover:bg-ink/10'
                }`}
              >
                {categoryEmoji(category.slug)} {category.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {NARRATIVE_FIELDS.map((field) => (
        <div key={field.name}>
          <label htmlFor={field.name} className={labelClass}>
            {field.label}
            {field.required ? ' *' : ''}
          </label>
          <p className="text-xs text-ink/40 mb-1.5">{field.hint}</p>
          <textarea
            id={field.name}
            value={draft[field.name]}
            onChange={(e) => update(field.name, e.target.value)}
            maxLength={5000}
            rows={3}
            className={`${inputClass} resize-y`}
          />
        </div>
      ))}

      <fieldset className="paper-card rounded-lg p-4">
        <legend className="text-xs font-semibold text-ink/50 uppercase tracking-wider px-1">
          Where you learned it (optional)
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_9rem] gap-3">
          <input
            aria-label="Source title"
            value={draft.sourceTitle}
            onChange={(e) => update('sourceTitle', e.target.value)}
            placeholder="e.g. My grandmother in Pune"
            maxLength={200}
            className={inputClass}
          />
          <input
            aria-label="Source link"
            value={draft.sourceUrl}
            onChange={(e) => update('sourceUrl', e.target.value)}
            placeholder="https://… (optional)"
            className={inputClass}
          />
          <select
            aria-label="Source kind"
            value={draft.sourceKind}
            onChange={(e) => update('sourceKind', e.target.value as SourceKind)}
            className={inputClass}
          >
            {(Object.keys(sourceKindLabels) as SourceKind[]).map((kind) => (
              <option key={kind} value={kind}>
                {sourceKindLabels[kind]}
              </option>
            ))}
          </select>
        </div>
      </fieldset>

      <div className="sm:w-1/2">
        <label htmlFor="postedBy" className={labelClass}>
          Your name (optional)
        </label>
        <input
          id="postedBy"
          value={draft.postedBy}
          onChange={(e) => update('postedBy', e.target.value)}
          placeholder="Shown on the entry. Leave blank to post anonymously."
          maxLength={80}
          className={inputClass}
        />
      </div>

      {feedback && (
        <div role="alert" className="rounded-lg border-2 border-stamp-red/40 bg-stamp-red/5 p-4 text-sm">
          <p className="font-semibold text-stamp-red">{feedback.message}</p>
          {feedback.issues.length > 0 && (
            <ul className="mt-2 space-y-1 text-ink/70 list-disc pl-5">
              {feedback.issues.map((issue) => (
                <li key={`${issue.field}-${issue.message}`}>
                  {issue.field ? `${FIELD_LABELS[issue.field] ?? issue.field}: ` : ''}
                  {issue.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <p className="text-xs text-ink/40">
        Entries go live straight away. Please leave out phone numbers, emails, and anything
        that names a private person.
      </p>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 bg-ink text-cream rounded-lg font-medium hover:bg-navy transition-colors disabled:opacity-50"
      >
        {submitting ? 'Posting...' : 'Post this tradition'}
      </button>
    </form>
  );
}
