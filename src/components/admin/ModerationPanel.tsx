'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ModerationItem } from '@/lib/moderation/queue';
import type { StatusEvent } from '@/lib/schema/statusTransition';
import { flagReasonLabels, statusEventLabels, statusLabels } from '@/lib/entries/labels';

interface ModerationData {
  queue: ModerationItem[];
  stories: ModerationItem[];
}

const EVENT_STYLES: Partial<Record<StatusEvent, string>> = {
  dismissFlags: 'bg-ink/5 text-ink/70 hover:bg-ink/10',
  startReview: 'bg-slate-blue/10 text-slate-blue hover:bg-slate-blue/20',
  restore: 'bg-teal/15 text-teal-dark hover:bg-teal/25',
  hide: 'bg-amber/10 text-amber-dark hover:bg-amber/20',
  remove: 'bg-stamp-red/10 text-stamp-red hover:bg-stamp-red/20',
};

function describe(item: ModerationItem): string {
  return item.targetType === 'chainEntry'
    ? `the story by ${item.author ?? 'a visitor'} on "${item.entryTitle}"`
    : `"${item.entryTitle}"`;
}

function formatWhen(value: Date | string): string {
  return new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function ItemCard({
  item,
  busy,
  onEvent,
}: {
  item: ModerationItem;
  busy: boolean;
  onEvent: (item: ModerationItem, event: StatusEvent) => void;
}) {
  return (
    <li className="paper-card rounded-lg p-4 space-y-3" data-target={`${item.targetType}:${item.targetId}`}>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-semibold px-2 py-0.5 rounded-full bg-ink/5 text-ink/70">
          {item.targetType === 'entry' ? 'Entry' : 'Chain story'}
        </span>
        <span className="font-semibold px-2 py-0.5 rounded-full bg-amber/15 text-amber-dark">{statusLabels[item.status]}</span>
        <a href={`/superstition/${item.entryId}`} className="font-semibold text-ink hover:text-coral truncate">
          {item.entryTitle}
        </a>
        {item.author && <span className="text-ink/40">by {item.author}</span>}
      </div>
      <p className="text-sm text-ink/70 leading-relaxed line-clamp-4 whitespace-pre-line">{item.text}</p>
      {item.openFlags.length > 0 && (
        <ul className="text-xs text-ink/60 space-y-1 border-l-2 border-stamp-red/30 pl-3">
          {item.openFlags.map((flag, index) => (
            <li key={index}>
              <span className="font-semibold">{flagReasonLabels[flag.reason]}</span>
              {flag.note && <span> · {flag.note}</span>}
              <span className="text-ink/30"> · {formatWhen(flag.createdAt)}</span>
            </li>
          ))}
        </ul>
      )}
      {item.lastTransition && (
        <p className="text-xs text-ink/40">
          Last change: {statusLabels[item.lastTransition.from]} to {statusLabels[item.lastTransition.to]} by{' '}
          {item.lastTransition.actor === 'system' ? 'the flag threshold' : 'an admin'}, {formatWhen(item.lastTransition.at)}
        </p>
      )}
      {item.events.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {item.events.map((event) => (
            <button
              key={event}
              type="button"
              disabled={busy}
              onClick={() => onEvent(item, event)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors disabled:opacity-50 ${EVENT_STYLES[event] ?? ''}`}
            >
              {statusEventLabels[event]}
            </button>
          ))}
        </div>
      )}
    </li>
  );
}

export default function ModerationPanel({ password }: { password: string }) {
  const [data, setData] = useState<ModerationData | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/moderation', { headers: { 'x-admin-password': password } });
      if (res.ok) setData(await res.json());
      else setMessage('Could not load the queue. Reload and sign in again.');
    } catch {
      setMessage('Could not reach the server.');
    }
  }, [password]);

  useEffect(() => {
    load();
  }, [load]);

  async function apply(item: ModerationItem, event: StatusEvent) {
    const subject = describe(item);
    if (event === 'remove' && !window.confirm(`Remove ${subject} for good? Removed content cannot be restored.`)) {
      return;
    }
    setBusy(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ targetType: item.targetType, targetId: item.targetId, event }),
      });
      const result = await res.json();
      setMessage(
        res.ok
          ? `${statusEventLabels[event]}: ${subject} is now ${statusLabels[result.to as ModerationItem['status']].toLowerCase()}.`
          : result.message ?? 'That change did not go through.'
      );
      await load();
    } catch {
      setMessage('Could not reach the server.');
    } finally {
      setBusy(false);
    }
  }

  if (!data) {
    return <p className="text-sm text-ink/40">{message || 'Loading the queue…'}</p>;
  }

  return (
    <div className="space-y-10">
      {message && (
        <div className="paper-card rounded-lg p-3 text-sm text-amber-dark font-medium" role="status">
          {message}
        </div>
      )}

      <section>
        <h2 className="font-display text-lg text-ink mb-1">Moderation queue</h2>
        <p className="text-sm text-ink/40 mb-4">
          Anything flagged, under review or hidden, plus anything with open reports.
        </p>
        {data.queue.length === 0 ? (
          <p className="text-sm text-ink/40">Nothing waiting. The chain is holding.</p>
        ) : (
          <ul className="space-y-3">
            {data.queue.map((item) => (
              <ItemCard key={`${item.targetType}:${item.targetId}`} item={item} busy={busy} onEvent={apply} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-display text-lg text-ink mb-1">Recent chain stories</h2>
        <p className="text-sm text-ink/40 mb-4">Stories go live at once, so they are listed here before anyone reports them.</p>
        {data.stories.length === 0 ? (
          <p className="text-sm text-ink/40">No stories yet.</p>
        ) : (
          <ul className="space-y-3">
            {data.stories.map((item) => (
              <ItemCard key={item.targetId} item={item} busy={busy} onEvent={apply} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
