import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { visitorIdSchema } from '@/lib/entries/input';
import { VISITOR_COOKIE } from './visitorCookie';

/** The cookie is set by the browser, so its value is parsed like any other untrusted input. */
export function parseVisitorId(value: string | undefined): string | null {
  const parsed = visitorIdSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

/** The visitor id of the browser rendering this page, for server components. Never render it. */
export async function currentVisitorId(): Promise<string | null> {
  return parseVisitorId((await cookies()).get(VISITOR_COOKIE)?.value);
}

export function requestVisitorId(request: NextRequest): string | null {
  return parseVisitorId(request.cookies.get(VISITOR_COOKIE)?.value);
}

/**
 * The cookie is the only place a write learns who the visitor is. Any visitorId in the body is
 * overwritten, so reads and writes from one browser always agree on the id.
 */
export function withVisitor(request: NextRequest, body: unknown): Record<string, unknown> {
  const fields = typeof body === 'object' && body !== null && !Array.isArray(body) ? body : {};
  return { ...fields, visitorId: requestVisitorId(request) ?? undefined };
}
