import { FIELD_LIMITS, trimField, type GuardrailField } from './limits';
import { EMAIL_PATTERN, PHONE_PATTERN } from './patterns';
import { findSlurMatches, type SlurMatch } from './slurs';
import { findSpamMatches, type SpamMatch } from './spam';

export type GuardrailResult = 'passed' | 'heldForEdit' | 'blocked';

export interface GuardrailMatch {
  rule: string;
  message: string;
  field?: string;
}

export interface GuardrailContentInput {
  contentType: 'entry' | 'chainStory' | 'flag';
  fields: Partial<Record<GuardrailField | 'text', string>>;
  sourceUrls?: string[];
  previousPosts?: string[];
}

export interface GuardrailCheckResult {
  result: GuardrailResult;
  matches: GuardrailMatch[];
  sanitized: Record<string, string>;
}

const TRIMMABLE_FIELDS: GuardrailField[] = [
  'title',
  'country',
  'postedBy',
  'theDefault',
  'whyItStarted',
  'whyItStuck',
  'whatsChangedSince',
  'freshLook',
  'uncertaintyNote',
  'chainText',
  'flagNote',
];

function sanitizeFields(fields: GuardrailContentInput['fields']): Record<string, string> {
  const sanitized: Record<string, string> = {};

  for (const [key, value] of Object.entries(fields)) {
    if (typeof value !== 'string') {
      continue;
    }

    if ((TRIMMABLE_FIELDS as string[]).includes(key)) {
      sanitized[key] = trimField(key as GuardrailField, value);
    } else if (key === 'text') {
      sanitized[key] = value.trim().slice(0, FIELD_LIMITS.chainText);
    } else {
      sanitized[key] = value.trim();
    }
  }

  return sanitized;
}

function findPiiMatches(text: string, field: string): GuardrailMatch[] {
  const matches: GuardrailMatch[] = [];

  if (EMAIL_PATTERN.test(text)) {
    matches.push({
      rule: 'email',
      field,
      message: 'Please remove email addresses before posting.',
    });
  }

  if (PHONE_PATTERN.test(text)) {
    matches.push({
      rule: 'phone',
      field,
      message: 'Please remove phone numbers before posting.',
    });
  }

  return matches;
}

function slurMatchesToGuardrail(matches: SlurMatch[]): GuardrailMatch[] {
  return matches.map((match) => ({
    rule: 'slur',
    message: 'Content contains language that is not allowed.',
    field: match.term,
  }));
}

function spamMatchesToGuardrail(matches: SpamMatch[]): GuardrailMatch[] {
  return matches.map((match) => ({
    rule: match.rule,
    message: match.detail,
  }));
}

export function checkContent(input: GuardrailContentInput): GuardrailCheckResult {
  const sanitized = sanitizeFields(input.fields);
  const combinedText = Object.values(sanitized).join('\n');
  const matches: GuardrailMatch[] = [];

  for (const [field, value] of Object.entries(sanitized)) {
    matches.push(...findPiiMatches(value, field));
  }

  const slurs = findSlurMatches(combinedText);
  if (slurs.length > 0) {
    return {
      result: 'blocked',
      matches: [...matches, ...slurMatchesToGuardrail(slurs)],
      sanitized,
    };
  }

  const piiOnly = matches.filter((match) => match.rule === 'email' || match.rule === 'phone');
  if (piiOnly.length > 0) {
    return {
      result: 'heldForEdit',
      matches: piiOnly,
      sanitized,
    };
  }

  const spam = findSpamMatches({
    contentType: input.contentType === 'flag' ? 'entry' : input.contentType,
    fields: sanitized,
    sourceUrls: input.sourceUrls,
    previousPosts: input.previousPosts,
  });

  if (spam.length > 0) {
    return {
      result: 'blocked',
      matches: [...matches, ...spamMatchesToGuardrail(spam)],
      sanitized,
    };
  }

  return {
    result: 'passed',
    matches: [],
    sanitized,
  };
}
