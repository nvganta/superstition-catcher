'use client';

import { useState } from 'react';

export default function SubmitMyth() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [myth, setMyth] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!myth.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || 'Anonymous',
          country: country.trim(),
          myth: myth.trim(),
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setName('');
        setCountry('');
        setMyth('');
        setTimeout(() => {
          setSubmitted(false);
          setOpen(false);
        }, 3000);
      }
    } catch (err) {
      console.error('Failed to submit:', err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 ${
          open
            ? 'bg-ink text-cream'
            : 'bg-gradient-to-r from-coral to-amber text-white'
        }`}
        aria-label="Submit a superstition"
      >
        <span className="text-lg">{open ? '✕' : '🔮'}</span>
        <span className="text-sm font-semibold tracking-tight hidden sm:inline">
          {open ? 'Close' : 'Got a myth?'}
        </span>
      </button>

      {/* Submission Panel */}
      {open && (
        <div className="fixed bottom-20 right-5 z-50 w-[340px] max-w-[calc(100vw-2.5rem)] animate-in">
          <div className="paper-card rounded-xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-coral via-amber to-teal p-[2px]">
              <div className="bg-cream rounded-t-[10px] px-5 pt-5 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🕵️</span>
                  <h3 className="font-display text-base text-ink tracking-tight">
                    SUBMIT A MYTH
                  </h3>
                </div>
                <p className="text-xs text-ink/40 leading-relaxed">
                  Know a superstition we haven&apos;t covered? Tell us about it
                  and we might add it!
                </p>
              </div>
            </div>

            {/* Form */}
            {submitted ? (
              <div className="p-6 text-center">
                <div className="text-3xl mb-2">🎉</div>
                <p className="font-display text-sm text-ink mb-1">
                  MYTH RECEIVED!
                </p>
                <p className="text-xs text-ink/40">
                  We&apos;ll investigate and maybe add it to the collection.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-ink/40 mb-1 uppercase tracking-wider">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Optional"
                      maxLength={50}
                      className="w-full px-3 py-2 bg-cream border-2 border-ink/8 rounded-lg text-xs text-ink placeholder:text-ink/25 focus:outline-none focus:border-amber transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-ink/40 mb-1 uppercase tracking-wider">
                      Country
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g. India"
                      maxLength={50}
                      className="w-full px-3 py-2 bg-cream border-2 border-ink/8 rounded-lg text-xs text-ink placeholder:text-ink/25 focus:outline-none focus:border-amber transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-ink/40 mb-1 uppercase tracking-wider">
                    The Superstition *
                  </label>
                  <textarea
                    value={myth}
                    onChange={(e) => setMyth(e.target.value)}
                    placeholder="Tell us about the superstition — what do people believe? Where did you hear it?"
                    maxLength={1000}
                    rows={4}
                    required
                    className="w-full px-3 py-2 bg-cream border-2 border-ink/8 rounded-lg text-xs text-ink placeholder:text-ink/25 focus:outline-none focus:border-amber transition-colors resize-none"
                  />
                  <div className="text-right text-[10px] text-ink/20 mt-0.5">
                    {myth.length}/1000
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !myth.trim()}
                  className="w-full py-2.5 bg-ink text-cream rounded-lg text-xs font-semibold hover:bg-navy transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Sending...' : 'Submit for Investigation 🔍'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
