import { SLUR_TERMS_EN } from './data/slurs.en';
import { SLUR_TERMS_HI } from './data/slurs.hi';
import { SLUR_TERMS_TE } from './data/slurs.te';
import { foldRomanizedIndic, normalizeForModeration, tokenizeForModeration } from './normalize';

/**
 * `word` matches a whole word or its plural in s, for short terms that hide inside ordinary words
 * ("spic" in "suspicious"). `anywhere` also matches with spaces, dots or leetspeak squeezed out,
 * for terms distinctive enough that no ordinary word contains them.
 */
export type SlurMatchMode = 'word' | 'anywhere';

export interface SlurTerm {
  term: string;
  match: SlurMatchMode;
}

export type SlurLocale = 'en' | 'hi' | 'te';

interface SlurLocaleList {
  terms: readonly SlurTerm[];
  /** Romanized Hindi and Telugu have no fixed spelling, so "chootiya" and "chutiya" must meet. */
  foldRomanized: boolean;
}

export const SLUR_LISTS: Record<SlurLocale, SlurLocaleList> = {
  en: { terms: SLUR_TERMS_EN, foldRomanized: false },
  hi: { terms: SLUR_TERMS_HI, foldRomanized: true },
  te: { terms: SLUR_TERMS_TE, foldRomanized: true },
};

/** Which list matched, never the term, so nothing downstream can echo it back. */
export interface SlurMatch {
  locale: SlurLocale;
}

type Fold = (value: string) => string;

interface PreparedText {
  words: ReadonlySet<string>;
  compact: string;
}

const unfolded: Fold = (value) => value;

function prepare(text: string, fold: Fold): PreparedText {
  return {
    words: new Set(tokenizeForModeration(text).map(fold)),
    compact: fold(normalizeForModeration(text)),
  };
}

function matchesTerm(text: PreparedText, { term, match }: SlurTerm, fold: Fold): boolean {
  const normalized = fold(normalizeForModeration(term));
  if (text.words.has(normalized) || text.words.has(`${normalized}s`)) {
    return true;
  }
  return match === 'anywhere' && text.compact.includes(normalized);
}

export function findSlurMatches(text: string): SlurMatch[] {
  const prepared = { plain: prepare(text, unfolded), folded: prepare(text, foldRomanizedIndic) };

  return (Object.entries(SLUR_LISTS) as [SlurLocale, SlurLocaleList][]).flatMap(([locale, list]) => {
    const fold = list.foldRomanized ? foldRomanizedIndic : unfolded;
    const target = list.foldRomanized ? prepared.folded : prepared.plain;
    return list.terms.some((term) => matchesTerm(target, term, fold)) ? [{ locale }] : [];
  });
}
