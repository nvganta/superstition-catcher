import { VISITOR_COOKIE } from './visitorCookie';

const STORAGE_KEY = 'sb-visitor-id';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

function valid(id: string | null | undefined): string | null {
  return id && UUID.test(id) ? id : null;
}

function readCookie(): string | null {
  const match = document.cookie.split('; ').find((part) => part.startsWith(`${VISITOR_COOKIE}=`));
  return valid(match ? decodeURIComponent(match.slice(VISITOR_COOKIE.length + 1)) : null);
}

function readStorage(): string | null {
  try {
    return valid(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function writeStorage(id: string) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {}
}

function writeCookie(id: string) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${VISITOR_COOKIE}=${encodeURIComponent(id)}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax${secure}`;
}

/**
 * Makes sure this browser carries its visitor id in a cookie, which is how every server read and
 * write learns who the visitor is. Ids from before the cookie existed live in localStorage and are
 * carried over, so their old reactions stay theirs. Returns 'restored' when an older id was just
 * copied into the cookie. Call it before any request that needs the visitor.
 */
export function ensureVisitorCookie(): 'present' | 'restored' | 'created' {
  const fromCookie = readCookie();
  const stored = readStorage();
  const id = fromCookie ?? stored ?? crypto.randomUUID();
  writeCookie(id);
  writeStorage(id);
  if (fromCookie) return 'present';
  return stored ? 'restored' : 'created';
}

export function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  ensureVisitorCookie();
  return readCookie() ?? '';
}
