---
name: mongodb-agent-safety
description: Keep autonomous agents and scripts on throwaway MongoDB only—block Atlas/production URIs, prefer in-memory or local mongod, and require dry-run before bulk writes. Use before running migrations, seeds, or tests that touch MongoDB.
---

# MongoDB agent safety

Autonomous agents must not mutate shared or production data. Treat every `MONGODB_URI` as hostile until validated.

## Rules (non-negotiable)

1. **Never** connect to production, staging shared clusters, or Atlas production tiers unless a human explicitly approves that exact URI in the current session.
2. **Prefer**, in order: in-memory test server (`mongodb-memory-server` or project test helper) → local `mongod` on `127.0.0.1` → disposable Docker container on a non-published port.
3. **Dry-run first** for migrations and seeds (`--dry-run` or read-only preview) when the tooling supports it.
4. **Do not** call admin/seed HTTP routes against deployed environments without explicit approval.
5. **Log** which URI pattern matched (never log full credentials).

## URI allow / deny

**Allow (typical dev):**

- `mongodb://127.0.0.1:<port>/<db>`
- `mongodb://localhost:<port>/<db>`
- In-memory connection strings from test harnesses

**Deny (fail closed):**

- `mongodb+srv://` hostnames matching managed cloud prod patterns (e.g. `*.mongodb.net` when policy says so)
- URI or env containing `production`, `.prod.`, or project-specific prod env var names
- Any URI copied from team password managers without human confirmation

Implement denial in code before `MongoClient.connect`. See `scripts/assert-safe-mongo-uri.mjs`.

## Agent workflow

1. Read `MONGODB_URI` from env; if missing, use the project's documented **local default** only.
2. Run URI assertion (script or shared library).
3. For one-off scripts: `ensure-indexes` → `seed` (if needed) → `migrate:dry-run` → `migrate`.
4. In tests: use the repo's in-memory helper; do not point integration tests at unknown URIs.
5. On assertion failure: stop, report the pattern that matched, do not retry with guesses.

## Checklist before `connect`

- [ ] URI validated by deny-list (or explicit human-approved exception recorded)
- [ ] Database name is clearly dev/test
- [ ] Migration/seed is dry-run or scoped to throwaway data
- [ ] No production hostnames in logs

## References

- `scripts/assert-safe-mongo-uri.mjs` — standalone guard for Node scripts
- `references/deny-patterns.md` — extend patterns per organization
