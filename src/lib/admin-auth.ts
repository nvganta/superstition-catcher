/**
 * Treat a missing or empty deployment secret as an authentication failure.
 * This prevents an accidentally unset ADMIN_PASSWORD from granting access to
 * callers that send an empty password or header.
 */
export function isAdminPassword(value: unknown): boolean {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  return (
    typeof configuredPassword === 'string' &&
    configuredPassword.length > 0 &&
    typeof value === 'string' &&
    value.length > 0 &&
    value === configuredPassword
  );
}
