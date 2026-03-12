'use client';

import { useState, useEffect, useCallback } from 'react';

interface Comment {
  _id?: string;
  superstitionId: string;
  name: string;
  text: string;
  createdAt: string;
}

export default function Comments({ superstitionId }: { superstitionId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?superstitionId=${superstitionId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  }, [superstitionId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !text.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ superstitionId, name: name.trim(), text: text.trim() }),
      });

      if (res.ok) {
        setName('');
        setText('');
        setShowForm(false);
        fetchComments();
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmitting(false);
    }
  }

  function timeAgo(dateStr: string) {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="text-xl">💬</span>
          <h2 className="font-display text-base tracking-tight text-ink">
            DISCUSSION ({comments.length})
          </h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm font-semibold text-coral hover:text-coral-dark transition-colors"
        >
          {showForm ? 'Cancel' : '+ Add Comment'}
        </button>
      </div>

      {/* Comment Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="paper-card rounded-xl p-5 mb-5">
          <div className="mb-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={50}
              className="w-full px-4 py-2.5 bg-cream border-2 border-ink/10 rounded-lg text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-amber transition-colors"
              required
            />
          </div>
          <div className="mb-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your thoughts, a personal story, or a different version of this superstition..."
              maxLength={1000}
              rows={3}
              className="w-full px-4 py-2.5 bg-cream border-2 border-ink/10 rounded-lg text-sm text-ink placeholder:text-ink/30 focus:outline-none focus:border-amber transition-colors resize-none"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink/30">{text.length}/1000</span>
            <button
              type="submit"
              disabled={submitting || !name.trim() || !text.trim()}
              className="px-5 py-2 bg-ink text-cream rounded-lg text-sm font-medium hover:bg-navy transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      )}

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((c, i) => (
            <div key={c._id || i} className="paper-card rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-coral to-amber flex items-center justify-center text-cream text-xs font-bold">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-ink">{c.name}</span>
                </div>
                <span className="text-xs text-ink/30">{timeAgo(c.createdAt)}</span>
              </div>
              <p className="text-sm text-ink/70 leading-relaxed pl-9">{c.text}</p>
            </div>
          ))}
        </div>
      ) : (
        !showForm && (
          <div className="text-center py-8">
            <div className="text-2xl mb-2">🤫</div>
            <p className="text-sm text-ink/40">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        )
      )}
    </div>
  );
}
