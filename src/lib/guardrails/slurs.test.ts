import { describe, expect, it } from 'vitest';
import { checkContent } from './checkContent';
import { findSlurMatches } from './slurs';

function localesIn(text: string) {
  return findSlurMatches(text).map((match) => match.locale);
}

describe('slur lists by locale', () => {
  it('finds Hindi slurs written in Devanagari', () => {
    expect(localesIn('उसने पड़ोसी को चूतिया कहा')).toEqual(['hi']);
    expect(localesIn('यह रंडी वाली बात है')).toEqual(['hi']);
  });

  it('treats a nukta, a zero-width joiner or spaces inside a Devanagari slur as the same word', () => {
    const decomposedNukta = 'भोसड़ीके';
    const precomposedNukta = 'भोसड़ीके';
    expect(localesIn(decomposedNukta)).toEqual(['hi']);
    expect(localesIn(precomposedNukta)).toEqual(['hi']);
    expect(localesIn('भोसडीके')).toEqual(['hi']);
    expect(localesIn('चू‍तिया')).toEqual(['hi']);
    expect(localesIn('मादर चोद')).toEqual(['hi']);
  });

  it('finds short-vowel spellings and inflected forms in Devanagari', () => {
    for (const text of ['चुतिया', 'वे चूतिये हैं', 'रंडियाँ', 'रंडियों से', 'कटुए']) {
      expect(localesIn(text), text).toEqual(['hi']);
    }
  });

  it('finds English slurs with leetspeak at the edge of a word or in common inflections', () => {
    for (const text of ['n1gg@', 'nigg@ please', '$pic go home', '$pics', 'you retarded idiot', 'RETARDED', 'niggaz', '(spic)']) {
      expect(localesIn(text), text).toEqual(['en']);
    }
    expect(localesIn('ｒｅｔａｒｄ')).toEqual(['en']);
    expect(localesIn('ni­gger')).toEqual(['en']);
  });

  it('finds common romanized spellings of Hindi slurs', () => {
    for (const text of ['what a chutiya', 'CHOOTIYA', 'chutiyaa log', 'chutiye', 'm@darch0d', 'bhen-chod', 'behenchod']) {
      expect(localesIn(text), text).toEqual(['hi']);
    }
  });

  it('finds Telugu slurs in Telugu script, inside longer words and romanized', () => {
    expect(localesIn('వాడు లంజకొడుకు')).toEqual(['te']);
    expect(localesIn('lanjakoduku')).toEqual(['te']);
    expect(localesIn('lanjaa ani tittadu')).toEqual(['te']);
    expect(localesIn('kojjaa')).toEqual(['te']);
  });

  it('leaves ordinary Hindi and Telugu alone, including words that sound like a slur in the other language', () => {
    expect(localesIn('లోపలికి రండి, భోజనం చేద్దాం')).toEqual([]);
    expect(localesIn('lopaliki randi, bhojanam cheddam')).toEqual([]);
    expect(localesIn('కలంజ విలంజ')).toEqual([]);
    expect(localesIn('मंडी में घमंडी व्यापारी पगडंडी पर चला')).toEqual([]);
    expect(localesIn('We took the train through Katwa and Kathua')).toEqual([]);
  });

  it('blocks a post with a Hindi slur without naming the term in the result', () => {
    const result = checkContent({ contentType: 'entry', fields: { theDefault: 'बड़े लोग उसे चूतिया कहते थे' } });
    expect(result.result).toBe('blocked');
    expect(result.matches).toEqual([{ rule: 'slur', message: 'Content contains language that is not allowed.' }]);
    expect(JSON.stringify(result.matches)).not.toMatch(/चूतिया|chutiya/);
  });
});
