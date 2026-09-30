const BLOCKED_URI_PATTERNS = [
  /mongodb\+srv:\/\/.*\.mongodb\.net/i,
  /production/i,
  /\.prod\./i,
  /MONGODB_URI_PROD/i,
];

export function assertSafeMongoUri(uri: string | undefined, context = 'script'): asserts uri is string {
  if (!uri) {
    throw new Error(`${context}: MONGODB_URI is required`);
  }

  for (const pattern of BLOCKED_URI_PATTERNS) {
    if (pattern.test(uri)) {
      throw new Error(`${context}: refusing to connect to production MongoDB`);
    }
  }
}

export const DB_NAME = 'superstition-buster';
