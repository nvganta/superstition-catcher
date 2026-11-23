# Architecture

## Overview

A Next.js App Router application documenting inherited cultural defaults ("traditions") as editable **Entries**, with community contributions and editorial curation.

## Data model (Wave 1)

The central object is **Entry** — a rethink record with narrative fields (`theDefault`, `whyItStarted`, `whyItStuck`, `whatsChangedSince`, optional `freshLook`) replacing the legacy myth-bust shape.

### Collections

| Collection | Purpose |
|------------|---------|
| `entries` | Live entry documents (slug `id`) |
| `entryVersions` | Immutable snapshots per entry version |
| `categories` | Life-area taxonomy |
| `flags` | User reports on entries or chain stories |
| `reactions` | Per-visitor rate/save/hide (Wave 3 wiring) |
| `chainEntries` | Broken Chain community stories |
| `aiNotes` | AI editorial notes (Wave 4) |
| `visitors` | Anonymous visitor records |
| `rateLimits` | TTL-backed posting counters |
| `superstitions` | Legacy collection; migration source only |

See [docs/DATA-MODEL.md](./docs/DATA-MODEL.md) for field-level detail.

## Layers

```
src/app/          → Routes & API handlers (server components read through the entry store)
src/components/   → UI
src/lib/entries/  → Entry store: typed reads, community posting, curated writes, HTTP mapping
src/lib/schema/   → Zod schemas + inferred types
src/lib/guardrails/ → Content moderation (pure functions)
src/lib/categories/ → Category seed data
src/data/         → Static seed (43 entries), read only by migrate-entries
scripts/          → Index ensure, entry migration, dev:local
```

## API (Wave 2)

- `GET /api/categories`: category list (auto-seeds if empty)
- `GET /api/entries?q=`: search live entries (text index plus title/country prefix), summary fields only
- `POST /api/entries`: community post. 201 live entry, 400 invalid fields, 422 guardrail hold/block, 429 rate limited
- `GET|POST /api/admin/entries`, `PUT /api/admin/entries/[id]`: admin list, curated create, versioned edit (409 on a stale `version`)
- `POST /api/admin/auth`: password check
- `GET|POST /api/comments`, `GET|POST /api/reactions`: unchanged, keyed by entry id

The legacy `/api/superstitions*`, `/api/submissions` and `/api/seed` routes were removed in Wave 2.

## Entry store

`createEntryStore(db)` in `src/lib/entries/store.ts` is the only code that queries `entries`. It parses each document with the Zod entry schema at the boundary (a malformed document is logged and skipped), so pages receive typed `Entry` values. Public reads only return `status: 'live'`. Writes return an `EntryWriteResult` union that `src/lib/entries/http.ts` maps to a response.

## Guardrails

`checkContent(fields)` returns `passed`, `heldForEdit` (PII), or `blocked` (slurs, spam). Rate limits live in the `rateLimits` collection with daily caps and a 30s minimum interval. `POST /api/entries` runs both, keyed on the visitor id from localStorage.

## Migration

`scripts/migrate-entries.ts` inserts static + legacy DB superstitions into `entries` and writes `entryVersions` v1. It never overwrites an existing entry, so rerunning it after admin edits is safe.

## Index policy

`scripts/ensure-indexes.ts` is idempotent. Unique keys: entry slug, flag triple, reaction triple, chain entry pair. TTL on `rateLimits.expiresAt`. `entries_text` is the search text index over the narrative fields, title, country and tags.
