import Link from 'next/link';

export default function EntryNotFound() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
      <div className="text-6xl mb-4">🕵️</div>
      <h1 className="font-display text-2xl text-ink mb-2">Entry Not Found</h1>
      <p className="text-ink/50 mb-6">This entry seems to have vanished into thin air.</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-cream rounded-lg font-medium text-sm hover:bg-navy transition-colors"
      >
        ← Back to HQ
      </Link>
    </div>
  );
}
