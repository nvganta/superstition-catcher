'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ensureVisitorCookie } from '@/lib/visitorId';

export default function UnhideButton({ entryId, title }: { entryId: string; title: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function unhide() {
    setPending(true);
    setFailed(false);
    try {
      ensureVisitorCookie();
      const res = await fetch(`/api/entries/${entryId}/reactions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind: 'hide', value: false }),
      });
      if (res.ok) router.refresh();
      else setFailed(true);
    } catch {
      setFailed(true);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={unhide}
      disabled={pending}
      aria-label={`Unhide ${title}`}
      className="px-3 py-1.5 text-xs font-medium bg-amber/10 text-amber-dark rounded-md hover:bg-amber/20 transition-colors shrink-0 disabled:opacity-50"
    >
      {pending ? 'Unhiding…' : failed ? 'Try again' : 'Unhide'}
    </button>
  );
}
