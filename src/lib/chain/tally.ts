/** The four ways a chain answer can land: was the tradition handed down, and is it kept today. */
export interface ChainTally {
  keptIt: number;
  droppedIt: number;
  pickedItUp: number;
  neverHadIt: number;
}

export type ChainOutcome = keyof ChainTally;

export function chainOutcome(passedDown: boolean, kept: boolean): ChainOutcome {
  if (passedDown) return kept ? 'keptIt' : 'droppedIt';
  return kept ? 'pickedItUp' : 'neverHadIt';
}

export function emptyTally(): ChainTally {
  return { keptIt: 0, droppedIt: 0, pickedItUp: 0, neverHadIt: 0 };
}
