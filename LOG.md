# Development Log

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

`npm run typecheck`, `npm run lint`, `npm test` (71 tests, most against a disposable mongod), `npm run build`, and a headless browser pass over every surface against `dev:local`.

### Not in Wave 2

- Old `submissions` documents are no longer shown anywhere. They stay in the database untouched.
- The rate limit trusts the client's localStorage visitor id, so a determined poster can reset it. IP-level limiting is a follow-up.
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
