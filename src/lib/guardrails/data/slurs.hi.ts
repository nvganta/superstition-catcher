import type { SlurTerm } from '../slurs';

/** Romanized "randi" is left out on purpose: in Telugu it is the polite "come". The Devanagari form is unambiguous. */
export const SLUR_TERMS_HI: readonly SlurTerm[] = [
  { term: 'मादरचोद', match: 'anywhere' },
  { term: 'बहनचोद', match: 'anywhere' },
  { term: 'भोसड़ीके', match: 'anywhere' },
  { term: 'चूतिया', match: 'anywhere' },
  { term: 'रंडी', match: 'word' },
  { term: 'कटुआ', match: 'word' },
  { term: 'madarchod', match: 'anywhere' },
  { term: 'maderchod', match: 'anywhere' },
  { term: 'behenchod', match: 'anywhere' },
  { term: 'bhenchod', match: 'anywhere' },
  { term: 'bhosdike', match: 'anywhere' },
  { term: 'bhosadike', match: 'anywhere' },
  { term: 'chutiya', match: 'anywhere' },
  { term: 'chutia', match: 'word' },
  { term: 'katua', match: 'word' },
];
