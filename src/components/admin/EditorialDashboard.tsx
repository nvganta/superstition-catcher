'use client';

import { useEffect, useState } from 'react';
import type { EditorialCheckGroup, EditorialDashboard as DashboardData } from '@/lib/editorial/dashboard';
import { originLabels, statusLabels } from '@/lib/entries/labels';

const ROWS_SHOWN = 8;

const GROUP_TITLES: Record<EditorialCheckGroup, { title: string; blurb: string }> = {
  migration: { title: 'Migration review', blurb: 'Entries carried over from the original collection that still need an editor.' },
  evidence: { title: 'Evidence gaps', blurb: 'Entries a reader cannot yet weigh.' },
};

function CheckCard({
  check,
  onOpenEntry,
}: {
  check: DashboardData['checks'][number];
  onOpenEntry: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const rows = expanded ? check.entries : check.entries.slice(0, ROWS_SHOWN);

  return (
    <li className="paper-card rounded-lg p-4" data-check={check.id}>
      <div className="flex items-baseline justify-between gap-3">
        <h4 className="font-semibold text-sm text-ink">{check.label}</h4>
        <span className="font-display text-2xl text-ink">{check.entries.length}</span>
      </div>
      <p className="text-xs text-ink/50 mt-1 mb-3">{check.description}</p>
      {check.entries.length === 0 ? (
        <p className="text-xs text-teal-dark">Nothing left here.</p>
      ) : (
        <ul className="space-y-1">
          {rows.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate text-ink/80">
                {entry.title}
                <span className="text-xs text-ink/40">
                  {' '}
                  · {originLabels[entry.origin]} · {statusLabels[entry.status]}
                </span>
              </span>
              <button
                type="button"
                onClick={() => onOpenEntry(entry.id)}
                className="shrink-0 px-2 py-1 text-xs font-medium bg-amber/10 text-amber-dark rounded-md hover:bg-amber/20"
              >
                Edit
              </button>
            </li>
          ))}
        </ul>
      )}
      {check.entries.length > ROWS_SHOWN && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs font-medium text-teal hover:underline"
        >
          {expanded ? 'Show fewer' : `Show all ${check.entries.length}`}
        </button>
      )}
    </li>
  );
}

export default function EditorialDashboard({
  password,
  onOpenEntry,
  onOpenModeration,
}: {
  password: string;
  onOpenEntry: (id: string) => void;
  onOpenModeration: () => void;
}) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/dashboard', { headers: { 'x-admin-password': password } })
      .then(async (res) => (res.ok ? setData(await res.json()) : setError('Could not load the dashboard.')))
      .catch(() => setError('Could not reach the server.'));
  }, [password]);

  if (!data) {
    return <p className="text-sm text-ink/40">{error || 'Loading the dashboard…'}</p>;
  }

  return (
    <div className="space-y-10" data-testid="editorial-dashboard">
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="paper-card rounded-lg p-4">
          <h3 className="font-display text-lg text-ink">Moderation</h3>
          <p className="text-sm text-ink/60 mt-1">
            {data.moderation.queued} waiting in the queue, {data.moderation.openFlags} open{' '}
            {data.moderation.openFlags === 1 ? 'report' : 'reports'}.
          </p>
          <button
            type="button"
            onClick={onOpenModeration}
            className="mt-3 px-3 py-1.5 text-xs font-medium bg-ink text-cream rounded-md hover:bg-navy"
          >
            Open the moderation queue
          </button>
        </div>
        <div className="paper-card rounded-lg p-4">
          <h3 className="font-display text-lg text-ink">AI note drafts</h3>
          {data.noteDrafts.length === 0 ? (
            <p className="text-sm text-ink/60 mt-1">No drafts waiting for review.</p>
          ) : (
            <ul className="mt-2 space-y-1">
              {data.noteDrafts.map((draft) => (
                <li key={draft.noteId} className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate text-ink/80">
                    {draft.entryTitle}
                    <span className="text-xs text-ink/40">
                      {' '}
                      · {draft.model} · {new Date(draft.createdAt).toLocaleDateString('en-GB')}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenEntry(draft.entryId)}
                    className="shrink-0 px-2 py-1 text-xs font-medium bg-slate-blue/15 text-slate-blue rounded-md hover:bg-slate-blue/25"
                  >
                    Review
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {(Object.keys(GROUP_TITLES) as EditorialCheckGroup[]).map((group) => (
        <section key={group}>
          <h3 className="font-display text-lg text-ink mb-1">{GROUP_TITLES[group].title}</h3>
          <p className="text-sm text-ink/40 mb-4">{GROUP_TITLES[group].blurb}</p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.checks
              .filter((check) => check.group === group)
              .map((check) => (
                <CheckCard key={check.id} check={check} onOpenEntry={onOpenEntry} />
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
