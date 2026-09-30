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
src/app/          → Routes & API handlers
src/components/   → UI (still reads static seed in Wave 1)
src/lib/schema/   → Zod schemas + inferred types
src/lib/guardrails/ → Content moderation (pure functions)
src/lib/categories/ → Category seed data
src/data/         → Static seed (42 entries); DB is runtime truth post-migration
scripts/          → Index ensure + entry migration CLIs
```

## API (Wave 1)

- `GET /api/categories` — read-only category list (auto-seeds if empty)

Legacy routes (`/api/superstitions`, etc.) remain unchanged until Wave 2.

## Guardrails

`checkContent(fields)` returns `passed`, `heldForEdit` (PII), or `blocked` (slurs, spam). Rate limits live in `rateLimits` collection with daily caps and a 30s minimum interval — not yet wired to routes.

## Migration

`scripts/migrate-entries.ts` upserts static + legacy DB superstitions into `entries` and writes `entryVersions` v1. Idempotent by entry `id`.

## Index policy

`scripts/ensure-indexes.ts` is idempotent. Unique keys: entry slug, flag triple, reaction triple, chain entry pair. TTL on `rateLimits.expiresAt`.
