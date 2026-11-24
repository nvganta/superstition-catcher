# Development Log

## 2026-11-23: Wave 4, intelligence and API

### Built

- **AI context notes** (`src/lib/aiNotes/`): in the entry editor an admin generates a short context note with Claude Opus 5.5 through the Anthropic SDK (structured output, server-side refusal fallback, medium effort). Notes are drafts until published, and a lifecycle table allows publish, discard and unpublish. Each note stores the model that answered, the prompt version, the entry version it was written from, and timestamps. The prompt forbids naming or inventing sources and requires an uncertainty statement. A published note renders on the entry page in a dashed frame labelled AI-generated, after the sourced sections, and says it cites nothing.
- **Not configured**: without `ANTHROPIC_API_KEY` the panel says so and `POST /api/admin/entries/:id/notes` answers 503 `notConfigured`. Nothing else changes.
- **Stub provider**: `AI_NOTES_PROVIDER=stub` writes canned notes with no API call. It runs only when `MONGODB_URI` is a loopback address and `VERCEL_ENV` is not `production`, and when refused it does not fall back to a real key. NODE_ENV cannot be the gate, since `next start` sets it to production locally.
- **Public data API** (`/api/v1/entries`, `/api/v1/entries/:id`, `/api/v1/categories`, `/api/v1/chain`): read-only, live entries only, region, category, origin and page/limit filters, Broken Chain tallies per entry and overall by region and generation. Entries are mapped field by field, so no visitor id, flag, status, legacy field or AI note leaves. CORS for GET, 30s browser and 60s CDN cache. `docs/API.md` has examples.
- **Editorial dashboard**: the first tab of `/admin`. It lists migrated entries whose "why it stuck" still holds the old practical explanation (the same six the migration report flags) and whose categories are still the automatic mapping, entries with no sources or no confidence, AI note drafts awaiting review, and moderation counts with a link into the Moderation tab. The checks read the entries themselves, so an entry leaves a list once an editor fixes it.
- **Slur lists by locale**: English, Hindi and Telugu tables in a registry. Matching handles Devanagari and Telugu script (NFKC, invisible joiners, nukta, candrabindu, long and short vowels) and folds romanized Hindi and Telugu spellings. A match reports only its locale.

### Fixed along the way

- A slur match carried the matched term in its `field`, one step from being echoed to a poster.
- Short English terms matched inside ordinary words, so "suspicious", "spice" and "fire retardant" were blocked. They now match whole words only; the allowlist that never ran is gone.

### Review

One independent review of the full diff. Fixed: leetspeak at a word's edge ("$pic") slipped past, "retarded" and "niggaz" were no longer caught, short-vowel and inflected Devanagari forms passed, and publishing a note archived the live note before the publish succeeded (a lost race left the entry with no note). A publish now claims its draft first and archives only older notes, so concurrent publishes converge on one. The API cache was shortened so a takedown leaves the CDN within about two minutes.

### Checks run

`npm run typecheck`, `npm run lint`, `npm test` (160 tests, most against a disposable mongod, with a stub provider or a fake `fetch` for every AI note test), `npm run build`, and a 20-check headless Playwright run against `next start` on a fresh `dev:local` database with the stub provider: generate, draft hidden from the public page, publish, labelled note on the entry page, dashboard with the draft, link into moderation, `/api/v1/entries?region=india&limit=5` and one entry with no private fields, a Devanagari slur rejected without echo, and the entry page at 390px with no horizontal scroll. No paid API call was made.

### Not in Wave 4

- No per-IP rate limit on `/api/v1`. The CDN cache absorbs repeats; a Vercel Firewall rate-limit rule on `/api/v1/*` is the cheap production fix.
- The Telugu and Hindi lists need a native speaker's review before they grow. Telugu terms inside longer words are not caught on purpose until then.
- `anywhere` terms still match across word and field boundaries once whitespace is squeezed out ("much utiya"). Low impact today.
- Admins cannot edit a draft note's text before publishing; they regenerate or discard.
- Generating a note has no throttle. It is admin-only, but each click is a paid call once a key is set.
- The public API does not carry published AI notes.

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
