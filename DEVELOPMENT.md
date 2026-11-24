# Development

## Prerequisites

- Node.js 20+
- Local MongoDB (Docker, `mongod`, or test in-memory helper)

## Setup

```bash
npm install
npm run dev:local            # disposable MongoDB + next dev, nothing to configure
```

`dev:local` boots `mongodb-memory-server`, runs the category, entry migration, reaction migration and index steps against it, and starts `next dev` with `MONGODB_URI` pointing at it. Extra arguments go to `next dev` (`npm run dev:local -- -p 3100`). To serve an existing production build instead, run `npm run build` and then `npm run dev:local -- start -p 3100`. The admin password is `local-admin` unless `ADMIN_PASSWORD` is already set. All data is discarded when the process exits.

To use your own local `mongod` instead, set the variables below and run `npm run dev`.

Set `MONGODB_URI` to a **local** database only, e.g. `mongodb://127.0.0.1:27017/superstition-buster-dev`.

Scripts refuse URIs matching production patterns (Atlas hostnames, `production`, etc.).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server (needs `MONGODB_URI`) |
| `npm run dev:local` | Disposable MongoDB, prepared, plus `next dev` |
| `npm test` | Vitest unit + integration tests |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run build` | Production build |
| `npm run ensure-indexes` | Create/update MongoDB indexes |
| `npm run seed:categories` | Upsert category taxonomy |
| `npm run migrate-entries:dry-run` | Preview entry migration |
| `npm run migrate-entries` | Insert missing entries + v1 versions (never overwrites an existing entry) |
| `npm run migrate-reactions:dry-run` | Preview the emoji-to-rating reaction migration |
| `npm run migrate-reactions` | Convert legacy reactions to ratings and archive the originals in `legacyReactions` (rerun-safe) |

## Preparing a database

1. Start local MongoDB.
2. `MONGODB_URI=mongodb://127.0.0.1:27017/superstition-buster-dev npm run seed:categories`
3. `MONGODB_URI=... npm run migrate-entries:dry-run`, then `npm run migrate-entries`
4. `MONGODB_URI=... npm run migrate-reactions:dry-run`, then `npm run migrate-reactions`
5. `MONGODB_URI=... npm run ensure-indexes`

Reactions migrate before indexes because the unique reactions index cannot be built over legacy reaction documents.

## Testing

Most tests use `startTestMongo()` (`src/test/mongoServer.ts`), which starts a disposable mongod through `mongodb-memory-server`. The first run downloads the mongod binary into `~/.cache/mongodb-binaries`. Older Wave 1 tests still use the lighter in-memory fake (`src/test/inMemoryMongo.ts`); it does not reproduce real update-operator rules, so prefer the real server for anything that writes.

For local integration against real `mongod`, set `MONGODB_URI` and run migration manually.

## Admin

`ADMIN_PASSWORD` protects `/admin` and `/api/admin/*`. A missing or empty value rejects every login. Do not point these at production data.

## AI notes

`ANTHROPIC_API_KEY` is optional. With it, an admin can generate a context note for an entry (Claude Opus 5.5, one request per click, paid). Without it, the AI note panel says notes are not configured and nothing else changes.

To try the flow without a key or a paid call, start `AI_NOTES_PROVIDER=stub npm run dev:local`. The stub writes canned text and is refused unless `MONGODB_URI` points at `localhost`, `127.0.0.1` or `[::1]` and `VERCEL_ENV` is not `production`. When refused it does not fall back to a real key.
