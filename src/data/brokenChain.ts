// The Broken Chain — first-person testimony about what happened to a belief
// inside a real family. The catalog says what people believed and why. This
// says what is happening to it right now.

export type Stance = 'stillDoIt' | 'changedIt' | 'stoppedIt' | 'neverKnewWhy';

export const stances: Stance[] = ['stillDoIt', 'changedIt', 'stoppedIt', 'neverKnewWhy'];

export const stanceLabels: Record<Stance, string> = {
  stillDoIt: 'We still do it',
  changedIt: 'We changed how we do it',
  stoppedIt: 'We stopped',
  neverKnewWhy: 'Never knew why until today',
};

export const stanceEmojis: Record<Stance, string> = {
  stillDoIt: '🪔',
  changedIt: '🔧',
  stoppedIt: '✂️',
  neverKnewWhy: '👀',
};

// Tailwind classes, kept alongside the labels so the bar and the badges can
// never drift apart.
export const stanceColors: Record<Stance, { bar: string; dot: string; tint: string }> = {
  stillDoIt: { bar: 'bg-amber', dot: 'bg-amber', tint: 'bg-amber/10' },
  changedIt: { bar: 'bg-teal', dot: 'bg-teal', tint: 'bg-teal/10' },
  stoppedIt: { bar: 'bg-coral', dot: 'bg-coral', tint: 'bg-coral/10' },
  neverKnewWhy: { bar: 'bg-slate-blue', dot: 'bg-slate-blue', tint: 'bg-slate-blue/10' },
};

// Prompts shown above the textarea. Asking "who did it" before "what changed"
// is the whole interview: ask it the other way and people write opinions about
// superstition instead of stories about their family.
export const stancePrompts: Record<Stance, string> = {
  stillDoIt: 'What keeps it going in your house?',
  changedIt: 'What does it look like now, compared to then?',
  stoppedIt: 'When did it stop, and did anyone mind?',
  neverKnewWhy: 'What did you always assume the reason was?',
};

export interface ChainEntry {
  _id?: string;
  superstitionId: string;
  visitorId: string;
  stance: Stance;
  name: string;
  whoDidIt: string;
  whatChanged: string;
  approved: boolean;
  createdAt: string;
}

export type StanceTally = Record<Stance, number>;

export const emptyTally: StanceTally = {
  stillDoIt: 0,
  changedIt: 0,
  stoppedIt: 0,
  neverKnewWhy: 0,
};

export function isStance(value: unknown): value is Stance {
  return typeof value === 'string' && (stances as string[]).includes(value);
}

export function tallyTotal(tally: StanceTally): number {
  return stances.reduce((sum, s) => sum + (tally[s] || 0), 0);
}

export function tallyPercent(tally: StanceTally, stance: Stance): number {
  const total = tallyTotal(tally);
  if (total === 0) return 0;
  return Math.round((tally[stance] / total) * 100);
}

// Field limits, shared by the client form and the API so the counter under the
// textarea and the server-side clamp can't disagree.
export const limits = {
  name: 50,
  whoDidIt: 120,
  whatChanged: 400,
} as const;
