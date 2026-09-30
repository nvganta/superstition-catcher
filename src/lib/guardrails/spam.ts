import { URL_PATTERN } from './patterns';
import { normalizeForModeration } from './normalize';

export interface SpamMatch {
  rule: 'linkInChainStory' | 'nonSourceLinkInEntry' | 'repeatedText' | 'nearDuplicate';
  detail: string;
}

const REPEATED_CHAR_PATTERN = /(.)\1{7,}/;

export function findUrls(text: string): string[] {
  return text.match(URL_PATTERN) ?? [];
}

export function hasRepeatedText(text: string): boolean {
  return REPEATED_CHAR_PATTERN.test(text);
}

export function similarityRatio(a: string, b: string): number {
  const left = normalizeForModeration(a);
  const right = normalizeForModeration(b);

  if (!left || !right) {
    return 0;
  }

  if (left === right) {
    return 1;
  }

  const shorter = left.length <= right.length ? left : right;
  const longer = left.length > right.length ? left : right;

  if (longer.includes(shorter)) {
    return shorter.length / longer.length;
  }

  let matches = 0;
  const window = shorter.length;
  for (let i = 0; i <= longer.length - window; i += 1) {
    const slice = longer.slice(i, i + window);
    let localMatches = 0;
    for (let j = 0; j < window; j += 1) {
      if (slice[j] === shorter[j]) {
        localMatches += 1;
      }
    }
    matches = Math.max(matches, localMatches);
  }

  return matches / longer.length;
}

export function isNearDuplicate(text: string, previousPosts: string[], threshold = 0.85): boolean {
  return previousPosts.some((previous) => similarityRatio(text, previous) >= threshold);
}

export function findSpamMatches(input: {
  contentType: 'entry' | 'chainStory';
  fields: Record<string, string | undefined>;
  sourceUrls?: string[];
  previousPosts?: string[];
}): SpamMatch[] {
  const matches: SpamMatch[] = [];
  const { contentType, fields, sourceUrls = [], previousPosts = [] } = input;

  if (contentType === 'chainStory') {
    const story = fields.chainText ?? fields.text ?? '';
    const urls = findUrls(story);
    if (urls.length > 0) {
      matches.push({
        rule: 'linkInChainStory',
        detail: `Links are not allowed in chain stories (${urls[0]})`,
      });
    }
  }

  if (contentType === 'entry') {
    const combined = [
      fields.theDefault,
      fields.whyItStarted,
      fields.whyItStuck,
      fields.whatsChangedSince,
      fields.freshLook,
    ]
      .filter(Boolean)
      .join('\n');

    const allowed = new Set(sourceUrls.map((url) => url.toLowerCase()));
    for (const url of findUrls(combined)) {
      if (!allowed.has(url.toLowerCase())) {
        matches.push({
          rule: 'nonSourceLinkInEntry',
          detail: `Non-source links are not allowed in entry body (${url})`,
        });
        break;
      }
    }
  }

  const body = Object.values(fields).filter(Boolean).join('\n');

  if (hasRepeatedText(body)) {
    matches.push({
      rule: 'repeatedText',
      detail: 'Repeated character sequences look like spam',
    });
  }

  if (previousPosts.length > 0 && isNearDuplicate(body, previousPosts)) {
    matches.push({
      rule: 'nearDuplicate',
      detail: 'This post is too similar to one of your recent submissions',
    });
  }

  return matches;
}
