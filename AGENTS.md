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
| **1** (current) | Schemas, categories, migration, guardrails, rate limits, docs |
| **2** | Switch read paths to DB, wire posting routes to guardrails + rate limits |
| **3** | Flags workflow, Broken Chain go-live, reactions redesign |
| **4** | AI notes, data API, editorial tooling |

## Key paths

- Schemas: `src/lib/schema/`
- Guardrails: `src/lib/guardrails/`
- Migration: `scripts/migrate-entries.ts`
- Indexes: `scripts/ensure-indexes.ts`
- Seed data (legacy): `src/data/superstitions.ts` — DB is source of truth after migration

## Testing

```bash
npm test
npm run typecheck
npm run lint
npm run build
```
