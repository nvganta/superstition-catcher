import { createHash, timingSafeEqual } from 'node:crypto';

const digest = (value: string) => createHash('sha256').update(value).digest();

/**
 * Treat a missing or empty deployment secret as an authentication failure.
 * This prevents an accidentally unset ADMIN_PASSWORD from granting access to
 * callers that send an empty password or header. The comparison runs on
 * fixed-length digests in constant time, so response timing says nothing
 * about how much of a guess was right.
 */
export function isAdminPassword(value: unknown): boolean {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  return (
    typeof configuredPassword === 'string' &&
    configuredPassword.length > 0 &&
    typeof value === 'string' &&
    value.length > 0 &&
    timingSafeEqual(digest(value), digest(configuredPassword))
  );
}
