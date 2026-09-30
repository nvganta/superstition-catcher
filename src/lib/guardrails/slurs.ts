import { SLUR_TERMS_EN } from './data/slurs.en';
import { normalizeForModeration, tokenizeForModeration } from './normalize';

/** Place names and common words that must never trigger a slur block. */
export const SLUR_FALSE_POSITIVE_ALLOWLIST = new Set([
  'scunthorpe',
  'penistone',
  'clitheroe',
  'assessment',
  'classic',
  'grape',
  'scrap',
]);

export function getSlurTerms(): readonly string[] {
  return SLUR_TERMS_EN;
}

export interface SlurMatch {
  term: string;
  normalizedFragment: string;
}

export function findSlurMatches(text: string): SlurMatch[] {
  const tokens = tokenizeForModeration(text);
  const compact = normalizeForModeration(text);
  const matches: SlurMatch[] = [];

  for (const term of SLUR_TERMS_EN) {
    if (SLUR_FALSE_POSITIVE_ALLOWLIST.has(term)) {
      continue;
    }

    const normalizedTerm = normalizeForModeration(term);

    if (tokens.includes(term) || compact.includes(normalizedTerm)) {
      matches.push({ term, normalizedFragment: normalizedTerm });
    }
  }

  return matches;
}
