#!/usr/bin/env node
/**
 * Fail closed before MongoDB connect. Usage:
 *   node assert-safe-mongo-uri.mjs "$MONGODB_URI"
 * Exit 0 if safe; exit 1 with message if blocked or missing.
 */

const BLOCKED_URI_PATTERNS = [
  /mongodb\+srv:\/\/.*\.mongodb\.net/i,
  /production/i,
  /\.prod\./i,
  /MONGODB_URI_PROD/i,
];

const uri = process.argv[2] ?? process.env.MONGODB_URI;
const context = process.env.SAFE_MONGO_CONTEXT ?? 'script';

if (!uri) {
  console.error(`${context}: MONGODB_URI is required`);
  process.exit(1);
}

for (const pattern of BLOCKED_URI_PATTERNS) {
  if (pattern.test(uri)) {
    console.error(`${context}: refusing to connect to production MongoDB (matched ${pattern})`);
    process.exit(1);
  }
}

console.log(`${context}: URI passed local-safety checks`);
process.exit(0);
