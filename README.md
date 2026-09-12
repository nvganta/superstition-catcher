# Superstition Catcher

A browsable catalog of superstitions, organized by region and category, with
search, a "superstition of the day," community submissions, and The Broken
Chain: first-person accounts of what happened to a belief inside a real family.

## State

Revived 2026-08-27 after dormancy since 2026-03-12.

Catalog copy lives in a static in-repo store (`src/data/superstitions.ts`, 42
entries across 7 regions). Everything readers write (comments, reactions,
submissions, chain entries) lives in MongoDB.

## Stack

Next.js App Router, TypeScript, Tailwind, MongoDB, Anthropic SDK.

## Running

```bash
npm install
npm run dev
```

## Environment

| Variable | Required for | Notes |
| --- | --- | --- |
| `MONGODB_URI` | Comments, reactions, submissions, chain entries | Database `superstition-buster` |
| `ADMIN_PASSWORD` | `/admin`, moderation, AI drafts | Sent as the `x-admin-password` header |
| `ANTHROPIC_API_KEY` | `POST /api/explain` | Optional; without it the origin research button returns 503 and nothing else breaks |

## The Broken Chain

Each superstition page collects one entry per visitor, tagged with a stance:
still do it, changed how we do it, stopped, or never knew why. The stance
counts toward the public bar immediately; the written story is held for admin
approval first, because these get personal. `/chains` ranks the catalog by
which traditions are fading, mutating, or holding on.

## Origin research

`POST /api/explain` drafts case-file sections from a raw submission using
Claude. It is admin-gated and its output is never published directly: every
draft carries a confidence rating and an uncertainty note, and a human loads it
into the editor and verifies it before it becomes a case file.

See LOG.md for founder status.
