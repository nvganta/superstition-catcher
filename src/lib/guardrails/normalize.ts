const LEET_MAP: Record<string, string> = {
  '@': 'a',
  '4': 'a',
  '8': 'b',
  '(': 'c',
  '<': 'c',
  '3': 'e',
  '6': 'g',
  '#': 'h',
  '1': 'i',
  '!': 'i',
  '|': 'i',
  '0': 'o',
  '5': 's',
  '$': 's',
  '7': 't',
  '+': 't',
};

const INVISIBLE = /[­​-‍⁠﻿]/g;
const DEVANAGARI_NUKTA = /़/g;
const DEVANAGARI_CANDRABINDU = /ँ/g;
const DEVANAGARI_ANUSVARA = 'ं';
const DEVANAGARI_LONG_U = /ू/g;
const DEVANAGARI_SHORT_U = 'ु';
const DEVANAGARI_LONG_I = /ी/g;
const DEVANAGARI_SHORT_I = 'ि';
const NOT_WORD_CHAR = /[^\p{L}\p{M}\p{N}]+/u;
const EDGE_PUNCTUATION = /^[^\p{L}\p{M}\p{N}]+|[^\p{L}\p{M}\p{N}]+$/gu;

/**
 * One spelling per letter: compatibility forms folded (fullwidth letters), no invisible joiners
 * or soft hyphens, and the Devanagari marks people swap freely (a nukta dropped, a candrabindu
 * written as an anusvara).
 */
function canonicalLetters(text: string): string {
  return text
    .normalize('NFKC')
    .toLowerCase()
    .replace(INVISIBLE, '')
    .replace(DEVANAGARI_NUKTA, '')
    .replace(DEVANAGARI_CANDRABINDU, DEVANAGARI_ANUSVARA);
}

function unLeet(text: string): string {
  return [...text].map((char) => LEET_MAP[char] ?? char).join('');
}

export function normalizeForModeration(text: string): string {
  return unLeet(canonicalLetters(text).replace(/[\s\-_.*]+/g, ''));
}

/**
 * Words with leetspeak undone. A symbol at a word's edge is either punctuation ("(spic)") or a
 * letter ("$pic"), so each chunk yields both readings.
 */
export function tokenizeForModeration(text: string): string[] {
  return canonicalLetters(text)
    .split(/\s+/)
    .flatMap((chunk) => [
      ...unLeet(chunk.replace(EDGE_PUNCTUATION, '')).split(NOT_WORD_CHAR),
      ...unLeet(chunk).replace(EDGE_PUNCTUATION, '').split(NOT_WORD_CHAR),
    ])
    .filter(Boolean);
}

/**
 * Hindi and Telugu have no fixed spelling in Latin letters, and Devanagari writers often swap
 * long and short vowels, so "chootiya", "chutiya", "चूतिया" and "चुतिया" must meet.
 */
export function foldIndicSpelling(text: string): string {
  return text
    .replace(/oo|uu/g, 'u')
    .replace(/ee|ii/g, 'i')
    .replace(/aa/g, 'a')
    .replace(/w/g, 'v')
    .replace(/([a-z])\1+/g, '$1')
    .replace(DEVANAGARI_LONG_U, DEVANAGARI_SHORT_U)
    .replace(DEVANAGARI_LONG_I, DEVANAGARI_SHORT_I);
}
