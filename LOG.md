# Development Log

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
