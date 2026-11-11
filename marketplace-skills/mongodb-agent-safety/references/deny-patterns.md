# Extending deny patterns

Add organization-specific patterns to the `BLOCKED_URI_PATTERNS` array in `scripts/assert-safe-mongo-uri.mjs` (or your shared library).

Examples teams often add:

- Hostnames: `/\.staging\.example\.com/i`
- Database names: `/mongodb:\/\/[^/]+\/(prod|production)/i`
- Env var names: `/MONGO_.*_PROD/i`

Keep patterns documented in your internal runbook. Agents should not widen the allow list without human review.
