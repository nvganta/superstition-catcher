'use client';

import { Verdict, verdictLabels } from '@/data/superstitions';

const verdictStyles: Record<Verdict, { color: string; bg: string; border: string }> = {
  busted: {
    color: 'text-stamp-red',
    bg: 'bg-stamp-red/10',
    border: 'border-stamp-red',
  },
  hasMerit: {
    color: 'text-stamp-blue',
    bg: 'bg-stamp-blue/10',
    border: 'border-stamp-blue',
  },
  practicalOrigin: {
    color: 'text-stamp-green',
    bg: 'bg-stamp-green/10',
    border: 'border-stamp-green',
  },
};

const verdictIcons: Record<Verdict, string> = {
  busted: '✕',
  hasMerit: '◐',
  practicalOrigin: '✓',
};

export default function VerdictBadge({
  verdict,
  size = 'sm',
}: {
  verdict: Verdict;
  size?: 'sm' | 'lg';
}) {
  const style = verdictStyles[verdict];

  if (size === 'lg') {
    return (
      <div className={`stamp ${style.color} ${style.bg} ${style.border} text-lg px-5 py-2`}>
        <span className="mr-2 text-xl">{verdictIcons[verdict]}</span>
        {verdictLabels[verdict]}
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-display text-[0.65rem] tracking-wider uppercase border-2 rounded px-2 py-0.5 ${style.color} ${style.border} ${style.bg}`}
      style={{ transform: 'rotate(-2deg)' }}
    >
      <span className="text-xs">{verdictIcons[verdict]}</span>
      {verdictLabels[verdict]}
    </span>
  );
}
