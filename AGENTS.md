# Agent Guide

## Product direction

This app is shifting from myth-busting to a **living record of cultural drift**. Traditions are inherited defaults worth a fresh look. The **Entry** is the central object.

- Community submissions go live instantly.
- Team posts carry a curated label (`origin: curated`).
- Later waves add flags, Broken Chain go-live, reactions, AI notes, and a data API.

## Stack

Next.js App Router, TypeScript, Tailwind, MongoDB, Anthropic SDK.

## Safety rules for agents

- **Never** connect to production MongoDB.
- Use throwaway local MongoDB (`mongodb-memory-server`, local `mongod`, or the in-memory test helper) for scripts and tests.
- Do not call seed or admin mutation endpoints against real data without explicit approval.
- Do not push, open PRs, merge, or deploy unless the user explicitly asks.

## Wave plan

| Wave | Scope |
|------|-------|
| **1** (done) | Schemas, categories, migration, guardrails, rate limits, docs |
| **2** (current) | Read paths on the `entries` collection, community posting, curated admin flow, search |
| **3** | Flags workflow, Broken Chain go-live, reactions redesign |
| **4** | AI notes, data API, editorial tooling |

## Key paths

- Entry data access: `src/lib/entries/store.ts` (`createEntryStore(db)`, `getEntryStore()`). Pages and routes never query `entries` directly.
- Schemas: `src/lib/schema/`
- Guardrails: `src/lib/guardrails/`
- Migration: `scripts/migrate-entries.ts`
- Indexes: `scripts/ensure-indexes.ts`
- Seed data (legacy): `src/data/superstitions.ts`, read only by the migration script. The DB is the source of truth.
- Admin auth: `src/lib/admin-auth.ts` (`isAdminPassword` rejects a missing or empty `ADMIN_PASSWORD`)

## Running locally

`npm run dev:local` starts a disposable MongoDB, prepares it (indexes, categories, migrated entries), and runs `next dev` against it. The admin password is `local-admin` unless `ADMIN_PASSWORD` is set.

## Testing

Tests that need real query behavior (`$text`, aggregation, unique indexes) use `startTestMongo()` from `src/test/mongoServer.ts`, a disposable mongod.

```bash
npm test
npm run typecheck
npm run lint
npm run build
```
