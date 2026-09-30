import { describe, expect, it } from 'vitest';
import { checkContent } from './checkContent';
import { findSlurMatches, SLUR_FALSE_POSITIVE_ALLOWLIST } from './slurs';
import { trimField } from './limits';

describe('checkContent guardrails', () => {
  it('holds content with email addresses for edit', () => {
    const result = checkContent({
      contentType: 'entry',
      fields: {
        theDefault: 'Contact me at person@example.com for details',
      },
    });

    expect(result.result).toBe('heldForEdit');
    expect(result.matches.some((match) => match.rule === 'email')).toBe(true);
    expect(result.matches[0]?.message).toContain('remove email');
  });

  it('holds content with phone numbers for edit', () => {
    const result = checkContent({
      contentType: 'chainStory',
      fields: {
        chainText: 'Call me at +91 98765 43210 if you remember this ritual',
      },
    });

    expect(result.result).toBe('heldForEdit');
    expect(result.matches.some((match) => match.rule === 'phone')).toBe(true);
  });

  it('blocks slurs including leetspeak variants', () => {
    const result = checkContent({
      contentType: 'entry',
      fields: {
        theDefault: 'This post uses n1gg3r as an insult',
      },
    });

    expect(result.result).toBe('blocked');
    expect(result.matches.some((match) => match.rule === 'slur')).toBe(true);
  });

  it('does not block allowlisted place-name false positives', () => {
    const matches = findSlurMatches('We visited Scunthorpe on our trip');
    expect(matches).toHaveLength(0);
    expect(SLUR_FALSE_POSITIVE_ALLOWLIST.has('scunthorpe')).toBe(true);
  });

  it('blocks links in chain stories', () => {
    const result = checkContent({
      contentType: 'chainStory',
      fields: {
        chainText: 'Read more at https://spam.example.com/story',
      },
    });

    expect(result.result).toBe('blocked');
    expect(result.matches.some((match) => match.rule === 'linkInChainStory')).toBe(true);
  });

  it('blocks non-source links in entry bodies', () => {
    const result = checkContent({
      contentType: 'entry',
      fields: {
        theDefault: 'See https://random.blog/post for proof',
      },
      sourceUrls: ['https://trusted.source/paper'],
    });

    expect(result.result).toBe('blocked');
    expect(result.matches.some((match) => match.rule === 'nonSourceLinkInEntry')).toBe(true);
  });

  it('allows source links inside entry sources list only', () => {
    const result = checkContent({
      contentType: 'entry',
      fields: {
        theDefault: 'A widely repeated household practice.',
        whyItStarted: 'Historical context without links.',
      },
      sourceUrls: ['https://trusted.source/paper'],
    });

    expect(result.result).toBe('passed');
  });

  it('blocks repeated text spam', () => {
    const result = checkContent({
      contentType: 'entry',
      fields: {
        theDefault: 'This is spammmmmmmmmmmming content',
      },
    });

    expect(result.result).toBe('blocked');
    expect(result.matches.some((match) => match.rule === 'repeatedText')).toBe(true);
  });

  it('blocks near-duplicate visitor posts', () => {
    const result = checkContent({
      contentType: 'chainStory',
      fields: {
        chainText: 'My grandmother always knocked wood before travel.',
      },
      previousPosts: ['My grandmother always knocked wood before travel!'],
    });

    expect(result.result).toBe('blocked');
    expect(result.matches.some((match) => match.rule === 'nearDuplicate')).toBe(true);
  });

  it('trims overlong fields to documented limits', () => {
    const longTitle = 'T'.repeat(300);
    const result = checkContent({
      contentType: 'entry',
      fields: {
        title: longTitle,
        theDefault: 'Safe content',
      },
    });

    expect(result.sanitized.title?.length).toBe(200);
    expect(trimField('title', longTitle).length).toBe(200);
  });

  it('passes clean community content', () => {
    const result = checkContent({
      contentType: 'entry',
      fields: {
        title: 'Salt over the shoulder',
        theDefault: 'People still throw salt after a spill.',
        whyItStarted: 'Salt was once precious.',
        whyItStuck: 'The gesture became habit.',
        whatsChangedSince: 'It survives as a kitchen reflex.',
      },
    });

    expect(result.result).toBe('passed');
    expect(result.matches).toHaveLength(0);
  });
});
