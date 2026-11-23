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

const ZERO_WIDTH = /[​-‍⁠﻿]/g;
const DEVANAGARI_NUKTA = /़/g;
const DEVANAGARI_CANDRABINDU = /ँ/g;
const DEVANAGARI_ANUSVARA = 'ं';
const NOT_WORD_CHAR = /[^\p{L}\p{M}\p{N}]+/u;
const EDGE_PUNCTUATION = /^[^\p{L}\p{M}\p{N}]+|[^\p{L}\p{M}\p{N}]+$/gu;

/**
 * One spelling per letter: canonical Unicode order, no zero-width joiners, and the Devanagari
 * marks people swap freely (a nukta dropped, a candrabindu written as an anusvara).
 */
function canonicalLetters(text: string): string {
  return text
    .normalize('NFC')
    .toLowerCase()
    .replace(ZERO_WIDTH, '')
    .replace(DEVANAGARI_NUKTA, '')
    .replace(DEVANAGARI_CANDRABINDU, DEVANAGARI_ANUSVARA);
}

function unLeet(text: string): string {
  return [...text].map((char) => LEET_MAP[char] ?? char).join('');
}

export function normalizeForModeration(text: string): string {
  return unLeet(canonicalLetters(text).replace(/[\s\-_.*]+/g, ''));
}

/** Words with leetspeak inside them undone, so "n1gg3r" stays one word while "retard!" loses only its "!". */
export function tokenizeForModeration(text: string): string[] {
  return canonicalLetters(text)
    .split(/\s+/)
    .flatMap((chunk) => unLeet(chunk.replace(EDGE_PUNCTUATION, '')).split(NOT_WORD_CHAR))
    .filter(Boolean);
}

/** Collapses the vowel spellings and doubled letters that vary across romanized Hindi and Telugu. */
export function foldRomanizedIndic(text: string): string {
  return text
    .replace(/oo|uu/g, 'u')
    .replace(/ee|ii/g, 'i')
    .replace(/aa/g, 'a')
    .replace(/w/g, 'v')
    .replace(/([a-z])\1+/g, '$1');
}
