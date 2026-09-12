'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  regionLabels,
  categoryLabels,
  type Region,
  type Category,
  type Verdict,
} from '@/data/superstitions';
import { stanceEmojis, stanceLabels, type ChainEntry } from '@/data/brokenChain';

// Shape returned by /api/explain. Mirrors the Zod schema on that route.
interface OriginDraft {
  title: string;
  whatPeopleBelieve: string;
  historicalOrigin: string;
  theRealReason: string;
  modernTwist: string;
  suggestedVerdict: Verdict;
  suggestedRegion: Region;
  suggestedCategory: Category;
  confidence: 'high' | 'medium' | 'low';
  uncertaintyNote: string;
}

interface SuperstitionDoc {
  id: string;
  title: string;
  country: string;
  countryFlag: string;
  region: Region;
  category: Category;
  whatPeopleBelieve: string;
  historicalOrigin: string;
  theRealReason: string;
  modernTwist: string;
  verdict: Verdict;
  funFact?: string;
}

const emptySuperstition: Omit<SuperstitionDoc, 'id'> & { id: string } = {
  id: '',
  title: '',
  country: '',
  countryFlag: '',
  region: 'india',
  category: 'homeAndDaily',
  whatPeopleBelieve: '',
  historicalOrigin: '',
  theRealReason: '',
  modernTwist: '',
  verdict: 'busted',
  funFact: '',
};

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [superstitions, setSuperstitions] = useState<SuperstitionDoc[]>([]);
  const [editing, setEditing] = useState<SuperstitionDoc | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState<'superstitions' | 'submissions' | 'chain'>('superstitions');
  const [submissions, setSubmissions] = useState<Array<{
    _id: string;
    name: string;
    country: string;
    myth: string;
    status: string;
    createdAt: string;
  }>>([]);
  const [pendingChain, setPendingChain] = useState<ChainEntry[]>([]);
  // AI drafts, keyed by submission id. Held in memory only: a draft is a
  // starting point for a human, not a record.
  const [drafts, setDrafts] = useState<Record<string, OriginDraft>>({});
  const [drafting, setDrafting] = useState<string | null>(null);

  const fetchSuperstitions = useCallback(async () => {
    try {
      const res = await fetch('/api/superstitions');
      if (res.ok) {
        const data = await res.json();
        setSuperstitions(data);
      }
    } catch (err) {
      console.error('Failed to fetch:', err);
    }
  }, []);

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await fetch('/api/submissions', {
        headers: { 'x-admin-password': password },
      });
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (err) {
      console.error('Failed to fetch submissions:', err);
    }
  }, [password]);

  const fetchPendingChain = useCallback(async () => {
    try {
      const res = await fetch('/api/chain/pending', {
        headers: { 'x-admin-password': password },
      });
      if (res.ok) {
        const data = await res.json();
        setPendingChain(data);
      }
    } catch (err) {
      console.error('Failed to fetch pending chain entries:', err);
    }
  }, [password]);

  useEffect(() => {
    if (authenticated) {
      fetchSuperstitions();
      fetchSubmissions();
      fetchPendingChain();
    }
  }, [authenticated, fetchSuperstitions, fetchSubmissions, fetchPendingChain]);

  async function moderateChainEntry(id: string, action: 'approve' | 'reject') {
    try {
      const res = await fetch(`/api/chain/${id}`, {
        method: action === 'approve' ? 'PATCH' : 'DELETE',
        headers: { 'x-admin-password': password },
      });
      if (res.ok) {
        setPendingChain((prev) => prev.filter((e) => e._id !== id));
        setMessage(action === 'approve' ? 'Story published' : 'Story rejected');
      } else {
        setMessage('Moderation failed');
      }
    } catch {
      setMessage('Moderation failed');
    }
  }

  // Ask the research assistant to draft a case file from a raw submission.
  // The result is a starting point for the editor, never published as-is.
  async function investigate(submissionId: string, myth: string, country: string) {
    setDrafting(submissionId);
    setMessage('');
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify({ myth, country }),
      });
      const data = await res.json();
      if (res.ok && data.draft) {
        setDrafts((prev) => ({ ...prev, [submissionId]: data.draft }));
      } else {
        setMessage(data.error || 'The research assistant failed');
      }
    } catch {
      setMessage('The research assistant failed');
    } finally {
      setDrafting(null);
    }
  }

  // Load a draft into the superstition editor. Everything stays editable and
  // nothing is saved until the human hits save.
  function loadDraftIntoEditor(submissionId: string, country: string) {
    const draft = drafts[submissionId];
    if (!draft) return;
    setEditing({
      ...emptySuperstition,
      id: draft.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .slice(0, 60),
      title: draft.title,
      country: country || '',
      countryFlag: '',
      region: draft.suggestedRegion,
      category: draft.suggestedCategory,
      whatPeopleBelieve: draft.whatPeopleBelieve,
      historicalOrigin: draft.historicalOrigin,
      theRealReason: draft.theRealReason,
      modernTwist: draft.modernTwist,
      verdict: draft.suggestedVerdict,
      funFact: '',
    });
    setIsNew(true);
    setTab('superstitions');
    setMessage('Draft loaded. Check every claim before saving.');
  }

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

  async function handleSeed() {
    setSeeding(true);
    setMessage('');
    try {
      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'x-admin-password': password },
      });
      const data = await res.json();
      setMessage(data.message || `Seeded ${data.count} superstitions`);
      fetchSuperstitions();
    } catch {
      setMessage('Failed to seed');
    } finally {
      setSeeding(false);
    }
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true);
    setMessage('');

    try {
      if (isNew) {
        const res = await fetch('/api/superstitions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-password': password,
          },
          body: JSON.stringify(editing),
        });
        if (res.ok) {
          setMessage('Created successfully');
          setEditing(null);
          setIsNew(false);
          fetchSuperstitions();
        } else {
          const err = await res.json();
          setMessage(err.error || 'Failed to create');
        }
      } else {
        const res = await fetch(`/api/superstitions/${editing.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-admin-password': password,
          },
          body: JSON.stringify(editing),
        });
        if (res.ok) {
          setMessage('Updated successfully');
          setEditing(null);
          fetchSuperstitions();
        } else {
          const err = await res.json();
          setMessage(err.error || 'Failed to update');
        }
      }
    } catch {
      setMessage('Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this superstition?')) return;

    try {
      const res = await fetch(`/api/superstitions/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-password': password },
      });
      if (res.ok) {
        setMessage('Deleted successfully');
        fetchSuperstitions();
      }
    } catch {
      setMessage('Delete failed');
    }
  }

  // Login Screen
  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="paper-card rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">🔐</div>
          <h1 className="font-display text-2xl text-ink mb-2">Admin Access</h1>
          <p className="text-sm text-ink/50 mb-6">
            Enter the admin password to manage superstitions.
          </p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 bg-cream border-2 border-ink/10 rounded-lg text-ink placeholder:text-ink/30 focus:outline-none focus:border-amber mb-3"
            />
            {authError && (
              <p className="text-stamp-red text-sm mb-3">{authError}</p>
            )}
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

  // Editor Form
  if (editing) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-2xl text-ink">
            {isNew ? 'New Superstition' : 'Edit Superstition'}
          </h1>
          <button
            onClick={() => {
              setEditing(null);
              setIsNew(false);
            }}
            className="text-sm text-ink/40 hover:text-ink transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Title"
              value={editing.title}
              onChange={(v) => setEditing({ ...editing, title: v })}
            />
            <Field
              label="Country"
              value={editing.country}
              onChange={(v) => setEditing({ ...editing, country: v })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field
              label="Country Flag (emoji)"
              value={editing.countryFlag}
              onChange={(v) => setEditing({ ...editing, countryFlag: v })}
            />
            <div>
              <label className="block text-xs font-semibold text-ink/50 mb-1.5 uppercase tracking-wider">
                Region
              </label>
              <select
                value={editing.region}
                onChange={(e) =>
                  setEditing({ ...editing, region: e.target.value as Region })
                }
                className="w-full px-4 py-2.5 bg-cream border-2 border-ink/10 rounded-lg text-sm text-ink focus:outline-none focus:border-amber"
              >
                {Object.entries(regionLabels).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink/50 mb-1.5 uppercase tracking-wider">
                Category
              </label>
              <select
                value={editing.category}
                onChange={(e) =>
                  setEditing({ ...editing, category: e.target.value as Category })
                }
                className="w-full px-4 py-2.5 bg-cream border-2 border-ink/10 rounded-lg text-sm text-ink focus:outline-none focus:border-amber"
              >
                {Object.entries(categoryLabels).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <TextArea
            label="What People Believe"
            value={editing.whatPeopleBelieve}
            onChange={(v) => setEditing({ ...editing, whatPeopleBelieve: v })}
          />
          <TextArea
            label="Historical Origin"
            value={editing.historicalOrigin}
            onChange={(v) => setEditing({ ...editing, historicalOrigin: v })}
          />
          <TextArea
            label="The Real Reason"
            value={editing.theRealReason}
            onChange={(v) => setEditing({ ...editing, theRealReason: v })}
          />
          <TextArea
            label="The Modern Twist"
            value={editing.modernTwist}
            onChange={(v) => setEditing({ ...editing, modernTwist: v })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink/50 mb-1.5 uppercase tracking-wider">
                Verdict
              </label>
              <select
                value={editing.verdict}
                onChange={(e) =>
                  setEditing({ ...editing, verdict: e.target.value as Verdict })
                }
                className="w-full px-4 py-2.5 bg-cream border-2 border-ink/10 rounded-lg text-sm text-ink focus:outline-none focus:border-amber"
              >
                <option value="busted">Busted</option>
                <option value="hasMerit">Has Merit</option>
                <option value="practicalOrigin">Practical Origin</option>
              </select>
            </div>
            <Field
              label="Fun Fact (optional)"
              value={editing.funFact || ''}
              onChange={(v) => setEditing({ ...editing, funFact: v })}
            />
          </div>

          {message && (
            <p className="text-sm font-medium text-amber">{message}</p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 bg-ink text-cream rounded-lg font-medium hover:bg-navy transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : isNew ? 'Create Superstition' : 'Save Changes'}
          </button>
        </div>
      </div>
    );
  }

  // List View
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl text-ink">Admin Panel</h1>
          <p className="text-sm text-ink/40 mt-1">
            {superstitions.length} superstitions in database
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="px-4 py-2 bg-teal/10 text-teal border border-teal/30 rounded-lg text-sm font-medium hover:bg-teal/20 transition-colors disabled:opacity-50"
          >
            {seeding ? 'Seeding...' : 'Seed Database'}
          </button>
          <button
            onClick={() => {
              setEditing({ ...emptySuperstition });
              setIsNew(true);
            }}
            className="px-4 py-2 bg-ink text-cream rounded-lg text-sm font-medium hover:bg-navy transition-colors"
          >
            + New Superstition
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-ink/5 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab('superstitions')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'superstitions'
              ? 'bg-cream text-ink shadow-sm'
              : 'text-ink/40 hover:text-ink/60'
          }`}
        >
          Superstitions ({superstitions.length})
        </button>
        <button
          onClick={() => { setTab('submissions'); fetchSubmissions(); }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'submissions'
              ? 'bg-cream text-ink shadow-sm'
              : 'text-ink/40 hover:text-ink/60'
          }`}
        >
          Submissions ({submissions.length})
        </button>
        <button
          onClick={() => { setTab('chain'); fetchPendingChain(); }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === 'chain'
              ? 'bg-cream text-ink shadow-sm'
              : 'text-ink/40 hover:text-ink/60'
          }`}
        >
          Chain queue ({pendingChain.length})
        </button>
      </div>

      {message && (
        <div className="paper-card rounded-lg p-3 mb-6 text-sm text-amber font-medium">
          {message}
        </div>
      )}

      {tab === 'chain' ? (
        <div>
          {pendingChain.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-3">⛓️</div>
              <p className="text-ink/40 font-medium">
                Queue is clear. Stances already count in the public bar; only these
                stories wait on you.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingChain.map((entry) => (
                <div key={entry._id} className="paper-card rounded-lg p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm">{stanceEmojis[entry.stance]}</span>
                      <span className="text-[11px] font-semibold text-ink/60 uppercase tracking-wide">
                        {stanceLabels[entry.stance]}
                      </span>
                      <span className="text-ink/15">·</span>
                      <span className="text-xs font-mono text-ink/30">
                        {entry.superstitionId}
                      </span>
                    </div>
                    <span className="text-xs text-ink/30 shrink-0">
                      {new Date(entry.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {entry.whoDidIt && (
                    <p className="text-xs text-ink/40 italic mb-1.5">{entry.whoDidIt}</p>
                  )}
                  <p className="text-sm text-ink/70 leading-relaxed mb-3">
                    {entry.whatChanged}
                  </p>

                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-ink/30">— {entry.name}</span>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => moderateChainEntry(entry._id!, 'reject')}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-coral border-2 border-coral/20 hover:bg-coral/10 transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => moderateChainEntry(entry._id!, 'approve')}
                        className="px-4 py-1.5 bg-ink text-cream rounded-lg text-xs font-semibold hover:bg-navy transition-colors"
                      >
                        Publish
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : tab === 'submissions' ? (
        <div>
          {submissions.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-4xl mb-3">📬</div>
              <p className="text-ink/40 font-medium">
                No submissions yet. The floating &quot;Got a myth?&quot; widget collects these.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((s) => (
                <div key={s._id} className="paper-card rounded-lg p-5">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-coral to-amber flex items-center justify-center text-cream text-xs font-bold">
                        {s.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold text-ink">{s.name}</span>
                      {s.country && (
                        <span className="text-xs text-ink/30">from {s.country}</span>
                      )}
                    </div>
                    <span className="text-xs text-ink/30 shrink-0">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-ink/70 leading-relaxed pl-9">{s.myth}</p>

                  <div className="pl-9 mt-3">
                    {!drafts[s._id] ? (
                      <button
                        onClick={() => investigate(s._id, s.myth, s.country)}
                        disabled={drafting === s._id}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-ink border-2 border-ink/10 hover:border-amber transition-colors disabled:opacity-40"
                      >
                        {drafting === s._id ? 'Investigating...' : '🔍 Investigate origin'}
                      </button>
                    ) : (
                      <DraftPanel
                        draft={drafts[s._id]}
                        onUse={() => loadDraftIntoEditor(s._id, s.country)}
                        onDiscard={() =>
                          setDrafts((prev) => {
                            const next = { ...prev };
                            delete next[s._id];
                            return next;
                          })
                        }
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : superstitions.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-ink/40 font-medium mb-4">
            Database is empty. Seed it with the initial superstitions data.
          </p>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="px-6 py-3 bg-ink text-cream rounded-lg font-medium hover:bg-navy transition-colors"
          >
            {seeding ? 'Seeding...' : 'Seed Database Now'}
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {superstitions.map((s) => (
            <div
              key={s.id}
              className="paper-card rounded-lg p-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-lg shrink-0">{s.countryFlag}</span>
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-ink truncate">
                    {s.title}
                  </div>
                  <div className="text-xs text-ink/40">
                    {s.country} · {categoryLabels[s.category]} · {s.verdict}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    setEditing(s);
                    setIsNew(false);
                  }}
                  className="px-3 py-1.5 text-xs font-medium bg-amber/10 text-amber-dark rounded-md hover:bg-amber/20 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="px-3 py-1.5 text-xs font-medium bg-stamp-red/10 text-stamp-red rounded-md hover:bg-stamp-red/20 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// An AI draft, shown with its own uncertainty front and centre. The confidence
// badge and the note sit ABOVE the prose on purpose: read the caveat first,
// then the seductive-sounding paragraphs.
function DraftPanel({
  draft,
  onUse,
  onDiscard,
}: {
  draft: OriginDraft;
  onUse: () => void;
  onDiscard: () => void;
}) {
  const confidenceStyle = {
    high: 'bg-teal/15 text-teal',
    medium: 'bg-amber/15 text-amber-dark',
    low: 'bg-stamp-red/15 text-stamp-red',
  }[draft.confidence];

  return (
    <div className="border-2 border-dashed border-ink/15 rounded-lg p-4 bg-cream">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="evidence-tag">AI Draft</span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${confidenceStyle}`}>
          {draft.confidence} confidence
        </span>
        <span className="text-xs text-ink/30">unverified</span>
      </div>

      <div className="bg-evidence-yellow/20 border-2 border-evidence-yellow/40 rounded-lg p-3 mb-3">
        <div className="text-[10px] font-semibold text-ink/50 uppercase tracking-wider mb-1">
          Verify before publishing
        </div>
        <p className="text-xs text-ink/70 leading-relaxed">{draft.uncertaintyNote}</p>
      </div>

      <div className="space-y-2.5 mb-3">
        <DraftField label="Title" value={draft.title} />
        <DraftField label="What people believe" value={draft.whatPeopleBelieve} />
        <DraftField label="Historical origin" value={draft.historicalOrigin} />
        <DraftField label="The real reason" value={draft.theRealReason} />
        <DraftField label="Modern twist" value={draft.modernTwist} />
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink/40 mb-3">
        <span>Suggests:</span>
        <span className="font-medium text-ink/60">{regionLabels[draft.suggestedRegion]}</span>
        <span>·</span>
        <span className="font-medium text-ink/60">{categoryLabels[draft.suggestedCategory]}</span>
        <span>·</span>
        <span className="font-medium text-ink/60">{draft.suggestedVerdict}</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onDiscard}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-ink/50 border-2 border-ink/10 hover:border-ink/25 transition-colors"
        >
          Discard
        </button>
        <button
          onClick={onUse}
          className="px-4 py-1.5 bg-ink text-cream rounded-lg text-xs font-semibold hover:bg-navy transition-colors"
        >
          Open in editor
        </button>
      </div>
    </div>
  );
}

function DraftField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold text-ink/35 uppercase tracking-wider mb-0.5">
        {label}
      </div>
      <p className="text-xs text-ink/70 leading-relaxed">{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-ink/50 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-cream border-2 border-ink/10 rounded-lg text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-amber"
      />
    </div>
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
    <div>
      <label className="block text-xs font-semibold text-ink/50 mb-1.5 uppercase tracking-wider">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full px-4 py-2.5 bg-cream border-2 border-ink/10 rounded-lg text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-amber resize-none"
      />
    </div>
  );
}
