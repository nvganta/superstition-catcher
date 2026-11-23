'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Category } from '@/lib/schema/category';
import type { Confidence, EntryStatus, Region, Source, SourceKind } from '@/lib/schema/common';
import type { Entry } from '@/lib/schema/entry';
import type { FieldIssue } from '@/lib/entries/results';
import {
  REGIONS,
  categoryEmoji,
  confidenceLabels,
  originLabels,
  regionLabels,
  sourceKindLabels,
} from '@/lib/entries/labels';

type AdminEntry = Omit<Entry, 'createdAt' | 'updatedAt'> & { createdAt: string; updatedAt: string };

interface SourceDraft {
  title: string;
  url: string;
  kind: SourceKind;
}

interface Draft {
  id: string;
  title: string;
  country: string;
  countryFlag: string;
  region: Region;
  categorySlugs: string[];
  tags: string;
  theDefault: string;
  whyItStarted: string;
  whyItStuck: string;
  whatsChangedSince: string;
  freshLook: string;
  confidence: Confidence | '';
  uncertaintyNote: string;
  sources: SourceDraft[];
  postedBy: string;
  status: EntryStatus;
}

type Editing = { mode: 'create'; draft: Draft } | { mode: 'edit'; entry: AdminEntry; draft: Draft };

const STATUSES: EntryStatus[] = ['live', 'flagged', 'underReview', 'hidden', 'removed'];

const emptyDraft: Draft = {
  id: '',
  title: '',
  country: '',
  countryFlag: '',
  region: 'india',
  categorySlugs: [],
  tags: '',
  theDefault: '',
  whyItStarted: '',
  whyItStuck: '',
  whatsChangedSince: '',
  freshLook: '',
  confidence: '',
  uncertaintyNote: '',
  sources: [{ title: '', url: '', kind: 'book' }],
  postedBy: '',
  status: 'live',
};

function draftFromEntry(entry: AdminEntry): Draft {
  return {
    id: entry.id,
    title: entry.title,
    country: entry.country,
    countryFlag: entry.countryFlag,
    region: entry.region,
    categorySlugs: entry.categorySlugs,
    tags: entry.tags.join(', '),
    theDefault: entry.theDefault,
    whyItStarted: entry.whyItStarted,
    whyItStuck: entry.whyItStuck,
    whatsChangedSince: entry.whatsChangedSince,
    freshLook: entry.freshLook ?? '',
    confidence: entry.confidence ?? '',
    uncertaintyNote: entry.uncertaintyNote ?? '',
    sources: entry.sources.map((source: Source) => ({ ...source, url: source.url ?? '' })),
    postedBy: entry.postedBy ?? '',
    status: entry.status,
  };
}

function payloadFromDraft(draft: Draft) {
  const { id, tags, sources, ...fields } = draft;
  return {
    ...fields,
    id,
    tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    sources: sources.filter((source) => source.title.trim() || source.url.trim()),
  };
}

const inputClass =
  'w-full px-4 py-2.5 bg-cream border-2 border-ink/10 rounded-lg text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-amber';
const labelClass = 'block text-xs font-semibold text-ink/50 mb-1.5 uppercase tracking-wider';

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [entries, setEntries] = useState<AdminEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [issues, setIssues] = useState<FieldIssue[]>([]);

  const fetchEntries = useCallback(async () => {
    const res = await fetch('/api/admin/entries', { headers: { 'x-admin-password': password } });
    if (res.ok) {
      setEntries(await res.json());
    }
  }, [password]);

  useEffect(() => {
    if (!authenticated) return;
    fetchEntries();
    fetch('/api/categories')
      .then((res) => (res.ok ? res.json() : []))
      .then(setCategories);
  }, [authenticated, fetchEntries]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAuthenticated(true);
        setAuthError('');
      } else {
        setAuthError('Wrong password');
      }
    } catch {
      setAuthError('Connection error');
    }
  }

  function startEditing(next: Editing) {
    setEditing(next);
    setMessage('');
    setIssues([]);
  }

  function updateDraft(patch: Partial<Draft>) {
    setEditing((current) => (current ? { ...current, draft: { ...current.draft, ...patch } } : current));
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    setMessage('');
    setIssues([]);

    const payload = payloadFromDraft(editing.draft);
    const request =
      editing.mode === 'create'
        ? fetch('/api/admin/entries', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
            body: JSON.stringify(payload),
          })
        : fetch(`/api/admin/entries/${editing.entry.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
            body: JSON.stringify({ ...payload, version: editing.entry.version }),
          });

    try {
      const res = await request;
      const data = await res.json();
      if (res.ok) {
        setMessage(
          editing.mode === 'create'
            ? `Created "${data.entry.title}"`
            : `Saved "${data.entry.title}" as version ${data.entry.version}`
        );
        setEditing(null);
        fetchEntries();
      } else {
        setMessage(data.message ?? data.error ?? 'Save failed');
        setIssues(data.issues ?? []);
      }
    } catch {
      setMessage('Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="paper-card rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">🔐</div>
          <h1 className="font-display text-2xl text-ink mb-2">Admin Access</h1>
          <p className="text-sm text-ink/50 mb-6">Enter the admin password to manage entries.</p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              aria-label="Admin password"
              className="w-full px-4 py-3 bg-cream border-2 border-ink/10 rounded-lg text-ink placeholder:text-ink/30 focus:outline-none focus:border-amber mb-3"
            />
            {authError && <p className="text-stamp-red text-sm mb-3">{authError}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-ink text-cream rounded-lg font-medium hover:bg-navy transition-colors"
            >
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (editing) {
    const { draft } = editing;
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl text-ink">
              {editing.mode === 'create' ? 'New Curated Entry' : 'Edit Entry'}
            </h1>
            {editing.mode === 'edit' && (
              <p className="text-sm text-ink/40 mt-1">
                {originLabels[editing.entry.origin]} · version {editing.entry.version} · saving creates
                version {editing.entry.version + 1}
              </p>
            )}
          </div>
          <button
            onClick={() => setEditing(null)}
            className="text-sm text-ink/40 hover:text-ink transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Title" value={draft.title} onChange={(title) => updateDraft({ title })} />
            {editing.mode === 'create' ? (
              <Field
                label="Id (optional, from title)"
                value={draft.id}
                onChange={(id) => updateDraft({ id })}
              />
            ) : (
              <Field label="Id" value={draft.id} onChange={() => undefined} readOnly />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Country" value={draft.country} onChange={(country) => updateDraft({ country })} />
            <Field
              label="Country Flag (emoji)"
              value={draft.countryFlag}
              onChange={(countryFlag) => updateDraft({ countryFlag })}
            />
            <div>
              <label htmlFor="admin-region" className={labelClass}>
                Region
              </label>
              <select
                id="admin-region"
                value={draft.region}
                onChange={(e) => updateDraft({ region: e.target.value as Region })}
                className={inputClass}
              >
                {REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {regionLabels[region]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <fieldset>
            <legend className={labelClass}>Categories</legend>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const selected = draft.categorySlugs.includes(category.slug);
                return (
                  <button
                    key={category.slug}
                    type="button"
                    aria-pressed={selected}
                    onClick={() =>
                      updateDraft({
                        categorySlugs: selected
                          ? draft.categorySlugs.filter((slug) => slug !== category.slug)
                          : [...draft.categorySlugs, category.slug],
                      })
                    }
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      selected ? 'bg-ink text-cream' : 'bg-ink/5 text-ink/60 hover:bg-ink/10'
                    }`}
                  >
                    {categoryEmoji(category.slug)} {category.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <Field label="Tags (comma separated)" value={draft.tags} onChange={(tags) => updateDraft({ tags })} />

          <TextArea label="The Default" value={draft.theDefault} onChange={(theDefault) => updateDraft({ theDefault })} />
          <TextArea
            label="Why It Started"
            value={draft.whyItStarted}
            onChange={(whyItStarted) => updateDraft({ whyItStarted })}
          />
          <TextArea label="Why It Stuck" value={draft.whyItStuck} onChange={(whyItStuck) => updateDraft({ whyItStuck })} />
          <TextArea
            label="What's Changed Since"
            value={draft.whatsChangedSince}
            onChange={(whatsChangedSince) => updateDraft({ whatsChangedSince })}
          />
          <TextArea
            label="A Fresh Look (optional)"
            value={draft.freshLook}
            onChange={(freshLook) => updateDraft({ freshLook })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="admin-confidence" className={labelClass}>
                Confidence {editing.mode === 'create' || editing.entry.origin === 'curated' ? '*' : ''}
              </label>
              <select
                id="admin-confidence"
                value={draft.confidence}
                onChange={(e) => updateDraft({ confidence: e.target.value as Confidence | '' })}
                className={inputClass}
              >
                <option value="">Not set</option>
                {(Object.keys(confidenceLabels) as Confidence[]).map((confidence) => (
                  <option key={confidence} value={confidence}>
                    {confidenceLabels[confidence].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="admin-status" className={labelClass}>
                Status
              </label>
              <select
                id="admin-status"
                value={draft.status}
                onChange={(e) => updateDraft({ status: e.target.value as EntryStatus })}
                className={inputClass}
              >
                {STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Field
            label="Uncertainty Note (optional)"
            value={draft.uncertaintyNote}
            onChange={(uncertaintyNote) => updateDraft({ uncertaintyNote })}
          />

          <fieldset className="paper-card rounded-lg p-4 space-y-3">
            <legend className={`${labelClass} px-1`}>Sources</legend>
            {draft.sources.map((source, index) => (
              <div key={index} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_8rem_auto] gap-2">
                <input
                  aria-label={`Source ${index + 1} title`}
                  value={source.title}
                  onChange={(e) =>
                    updateDraft({
                      sources: draft.sources.map((s, i) => (i === index ? { ...s, title: e.target.value } : s)),
                    })
                  }
                  placeholder="Title"
                  className={inputClass}
                />
                <input
                  aria-label={`Source ${index + 1} link`}
                  value={source.url}
                  onChange={(e) =>
                    updateDraft({
                      sources: draft.sources.map((s, i) => (i === index ? { ...s, url: e.target.value } : s)),
                    })
                  }
                  placeholder="https://… (optional)"
                  className={inputClass}
                />
                <select
                  aria-label={`Source ${index + 1} kind`}
                  value={source.kind}
                  onChange={(e) =>
                    updateDraft({
                      sources: draft.sources.map((s, i) =>
                        i === index ? { ...s, kind: e.target.value as SourceKind } : s
                      ),
                    })
                  }
                  className={inputClass}
                >
                  {(Object.keys(sourceKindLabels) as SourceKind[]).map((kind) => (
                    <option key={kind} value={kind}>
                      {sourceKindLabels[kind]}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => updateDraft({ sources: draft.sources.filter((_, i) => i !== index) })}
                  className="px-3 text-xs font-medium text-stamp-red hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => updateDraft({ sources: [...draft.sources, { title: '', url: '', kind: 'book' }] })}
              className="text-sm font-medium text-teal hover:underline"
            >
              + Add source
            </button>
          </fieldset>

          {editing.mode === 'edit' && editing.entry.origin === 'community' && (
            <Field label="Posted By" value={draft.postedBy} onChange={(postedBy) => updateDraft({ postedBy })} />
          )}

          {message && (
            <div role="alert" className="text-sm">
              <p className="font-medium text-stamp-red">{message}</p>
              {issues.length > 0 && (
                <ul className="list-disc pl-5 mt-1 text-ink/70">
                  {issues.map((issue) => (
                    <li key={`${issue.field}-${issue.message}`}>
                      {issue.field ? `${issue.field}: ` : ''}
                      {issue.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-ink text-cream rounded-lg font-medium hover:bg-navy transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : editing.mode === 'create' ? 'Create Entry' : 'Save Changes'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl text-ink">Admin Panel</h1>
          <p className="text-sm text-ink/40 mt-1">{entries.length} entries in database</p>
        </div>
        <button
          onClick={() => startEditing({ mode: 'create', draft: { ...emptyDraft } })}
          className="px-4 py-2 bg-ink text-cream rounded-lg text-sm font-medium hover:bg-navy transition-colors"
        >
          + New Curated Entry
        </button>
      </div>

      {message && (
        <div className="paper-card rounded-lg p-3 mb-6 text-sm text-amber-dark font-medium">{message}</div>
      )}

      {entries.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-ink/40 font-medium">
            No entries yet. Run the migration script to import the seed collection.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div key={entry.id} className="paper-card rounded-lg p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-lg shrink-0">{entry.countryFlag}</span>
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-ink truncate">{entry.title}</div>
                  <div className="text-xs text-ink/40">
                    {entry.country} · {originLabels[entry.origin]} · {entry.status} · v{entry.version}
                  </div>
                </div>
              </div>
              <button
                onClick={() => startEditing({ mode: 'edit', entry, draft: draftFromEntry(entry) })}
                className="px-3 py-1.5 text-xs font-medium bg-amber/10 text-amber-dark rounded-md hover:bg-amber/20 transition-colors shrink-0"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  readOnly?: boolean;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <input
        type="text"
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} ${readOnly ? 'opacity-60' : ''}`}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className={`${inputClass} resize-y`}
      />
    </label>
  );
}
