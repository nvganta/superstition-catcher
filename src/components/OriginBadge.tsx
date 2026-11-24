import type { EntryOrigin } from '@/lib/schema/common';
import { originLabels } from '@/lib/entries/labels';

const originStyles: Record<EntryOrigin, { style: string; icon: string }> = {
  curated: { style: 'text-stamp-blue bg-stamp-blue/10 border-stamp-blue', icon: '✓' },
  community: { style: 'text-stamp-green bg-stamp-green/10 border-stamp-green', icon: '✎' },
};

export default function OriginBadge({
  origin,
  size = 'sm',
}: {
  origin: EntryOrigin;
  size?: 'sm' | 'lg';
}) {
  const { style, icon } = originStyles[origin];

  if (size === 'lg') {
    return (
      <div className={`stamp ${style} text-lg px-5 py-2`}>
        <span className="mr-2 text-xl">{icon}</span>
        {originLabels[origin]}
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-display text-[0.65rem] tracking-wider uppercase border-2 rounded px-2 py-0.5 ${style}`}
      style={{ transform: 'rotate(-2deg)' }}
    >
      <span className="text-xs">{icon}</span>
      {originLabels[origin]}
    </span>
  );
}
