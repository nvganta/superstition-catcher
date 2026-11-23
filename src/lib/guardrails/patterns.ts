export const EMAIL_PATTERN =
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;

/** International-ish phone numbers; intentionally broad to catch PII. */
export const PHONE_PATTERN =
  /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}(?:[\s.-]?\d{1,6})?/;

const MIN_PHONE_DIGITS = 10;

/** Year ranges such as "1600-1700" also fit PHONE_PATTERN, so a match needs a phone-length digit count. */
export function containsPhoneNumber(text: string): boolean {
  const matches = text.matchAll(new RegExp(PHONE_PATTERN.source, 'g'));
  return [...matches].some((match) => match[0].replace(/\D/g, '').length >= MIN_PHONE_DIGITS);
}

export const URL_PATTERN =
  /(?:https?:\/\/|www\.)[^\s]+|\b[a-z0-9-]+\.(?:com|org|net|io|co|app|dev|me|info|biz|xyz|link|click)(?:\/[^\s]*)?/gi;
