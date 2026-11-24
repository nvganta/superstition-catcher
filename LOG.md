# Development Log

## 2026-11-23: Wave 3, community features

### Built

- **Moderation** (`src/lib/moderation/`): one transition table over `live | flagged | underReview | hidden | removed`, applied only by `applyStatusEvent`, which logs actor and time to `statusTransitions`. Two open flags from distinct visitors take a live community entry or chain story off public pages; curated entries only queue. Past 10 automatic takedowns an hour, flags only queue. Admins restore, dismiss reports, review, hide or remove from a new Moderation tab in `/admin`, which also lists recent chain stories.
- **Broken Chain** (`src/lib/chain/`): on every entry page a visitor answers whether the tradition was handed to them and whether they keep it, with an optional story, region and generation. Answers upsert against the unique `(entryId, visitorId)` index. Stories pass the guardrails, and a new story counts against the chain-story rate limit.
- **Reactions** (`src/lib/reactions/`): star ratings, save and hide replace the emoji buttons. `/saved` lists saved and hidden entries; hidden entries leave that visitor's home, explore, category and related lists.
- **Visitor identity**: the visitor id lives in the `sb-visitor-id` cookie (older localStorage ids carry over). Routes read it from the cookie and overwrite any `visitorId` in a body. No public response or page payload carries one, and admin listings no longer do either.
- **`scripts/migrate-reactions.ts`**: converts old emoji reactions to ratings (mind blown 5, like 4, dislike 2), archives every original in `legacyReactions`, supports `--dry-run`, is rerun-safe, and runs in `dev:local`. `dev:local -- start` serves a production build.

### Fixed along the way

- `POST /api/entries` returned the poster's visitor id in its response.
- Admin edits could set `status` directly and undo a takedown. Edits now touch content only.

### Checks run

`npm run typecheck`, `npm run lint`, `npm test` (122 tests, most against a disposable mongod), `npm run build`, and a 34-step headless Playwright run against `next start` on a fresh `dev:local` database.

### Not in Wave 3

- Rate limits are still check-then-record and per browser-made visitor id, so parallel requests or fresh ids get past them. The takedown brake caps the damage from flags; atomic and IP-level limits are a follow-up.
- Legacy comments (`/api/comments`) have no guardrails, moderation or identity.
- Moderation actor is "admin", not a named person, since admins share one password.
- Search ignores a visitor's hidden entries by design; hiding shapes feeds, not lookup.

## 2026-11-23: Wave 2, read paths and posting

### Built

- **Entry store** (`src/lib/entries/`): `createEntryStore(db)` is the only code that queries `entries`. It parses documents with the Wave 1 Zod schemas and serves only `live` entries publicly.
- **Pages**: home, explore, categories, the new `/categories/[slug]`, entry detail (same `/superstition/[id]` URLs), entry of the day and search all read the store. Detail pages show the new model: the default, why it started, why it stuck, what's changed since, a fresh look, confidence, sources, origin.
- **Search**: `entries_text` text index plus title/country prefix matching, behind `GET /api/entries?q=`.
- **Community posting**: `/post` and `POST /api/entries`. Instant live, guardrails, 30s/5-a-day rate limits, v1 snapshot.
- **Curated admin flow**: `/admin` creates and edits entries. Curated entries need confidence and a source. Edits are optimistic on `version` and snapshot every version. Admin auth rejects a missing or empty `ADMIN_PASSWORD`.
- **Removed**: `/api/superstitions*`, `/api/submissions`, `/api/seed`, and the static-file read helpers.
- **`npm run dev:local`**: disposable MongoDB, prepared, plus `next dev`.

### Fixed along the way

- `recordRateLimitEvent` wrote `count` and `expiresAt` in two update operators, which a real MongoDB rejects. The in-memory fake hid it.
- Mongo clients stored undefined optional fields as `null`, which the entry schema rejects on read. All clients now set `ignoreUndefined`.
- `migrate-entries` now only inserts, so a rerun cannot revert admin edits.
- The phone-number guardrail held year ranges like "1600-1700". A match now needs ten digits.

### Checks run

`npm run typecheck`, `npm run lint`, `npm test` (74 tests, most against a disposable mongod), `npm run build`, and a headless browser pass over every surface against the production build, with data from `dev:local`.

### Not in Wave 2

- Old `submissions` documents are no longer shown anywhere. They stay in the database untouched.
- The rate limit trusts the client's localStorage visitor id, so a determined poster can reset it, and its check-then-record is not atomic. IP-level, atomic limiting is a follow-up.
- The setup scripts refuse Atlas URIs by design, so preparing the production database (indexes, categories, migration) needs a deliberate owner decision on how to run them.
- Flags, Broken Chain, reactions redesign, AI notes, data API (Waves 3 and 4).

## 2026-09-30 — Wave 1: Data model foundation

### Built

- **Schemas** (`src/lib/schema/`): Zod + TS types for Category, Entry, EntryVersion, Flag, Reaction, ChainEntry, AiNote, Visitor, RateLimit.
- **Category taxonomy**: 13 life-area categories with legacy 7→new slug mapping; idempotent seed + `GET /api/categories`.
- **Migration** (`scripts/migrate-entries.ts`): Maps 42 static superstitions + legacy `superstitions` collection → `entries` + `entryVersions` v1. Supports `--dry-run`, upsert-by-id, editorial flags for awkward `whyItStuck` seeds.
- **Indexes** (`scripts/ensure-indexes.ts`): Idempotent unique/TTL indexes.
- **Guardrails** (`src/lib/guardrails/`): PII hold, slur block (EN list + leetspeak normalize), spam rules, field trimming.
- **Rate limits** (`src/lib/guardrails/rateLimit.ts`): 5 entries / 10 chain / 20 flags per day; 30s min interval. Not wired to routes yet.
- **Tests**: Vitest coverage for schemas, guardrails, rate limits, migration, indexes.
- **Docs**: `docs/DATA-MODEL.md`, updated architecture/roadmap/agent guides.

### Judgment calls

- `whyItStuck` seeded from `theRealReason`; entries with practical/scientific tone flagged for editorial review in migration report.
- Slur list: small curated EN blocklist in code; extensible per locale. Scunthorpe-style allowlist avoids substring false positives.
- Tests use in-memory Mongo helper (not `mongodb-memory-server`) due to VM disk limits; same code paths as real driver.

### Not in Wave 1

- Site read paths still use `src/data/superstitions.ts` (Wave 2).
- Posting routes not wired to guardrails/rate limits (Wave 2).
- Flags, Broken Chain UI, reactions redesign, AI notes (Waves 3–4).
