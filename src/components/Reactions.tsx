'use client';

import { useState, useEffect, useCallback } from 'react';
import { getVisitorId } from '@/lib/visitorId';

interface ReactionCounts {
  like: number;
  dislike: number;
  mind_blown: number;
}

const reactionConfig = [
  { type: 'like', emoji: '👍', label: 'Interesting' },
  { type: 'mind_blown', emoji: '🤯', label: 'Mind Blown' },
  { type: 'dislike', emoji: '👎', label: 'Meh' },
] as const;

export default function Reactions({ superstitionId }: { superstitionId: string }) {
  const [counts, setCounts] = useState<ReactionCounts>({ like: 0, dislike: 0, mind_blown: 0 });
  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReactions = useCallback(async () => {
    try {
      const res = await fetch(`/api/reactions?superstitionId=${superstitionId}`);
      if (res.ok) {
        const data = await res.json();
        setCounts(data);
      }
    } catch (err) {
      console.error('Failed to fetch reactions:', err);
    }
  }, [superstitionId]);

  useEffect(() => {
    fetchReactions();
  }, [fetchReactions]);

  async function handleReaction(type: string) {
    if (loading) return;
    setLoading(true);

    try {
      const visitorId = getVisitorId();
      const res = await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ superstitionId, type, visitorId }),
      });

      if (res.ok) {
        const data = await res.json();
        setCounts(data);
        setActiveReaction(type);
      }
    } catch (err) {
      console.error('Failed to react:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {reactionConfig.map(({ type, emoji, label }) => (
        <button
          key={type}
          onClick={() => handleReaction(type)}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeReaction === type
              ? 'bg-amber/20 border-2 border-amber text-ink scale-105'
              : 'bg-ink/5 border-2 border-transparent text-ink/60 hover:bg-ink/10 hover:text-ink'
          } disabled:opacity-50`}
          title={label}
        >
          <span className="text-lg">{emoji}</span>
          <span>{counts[type as keyof ReactionCounts]}</span>
        </button>
      ))}
    </div>
  );
}
