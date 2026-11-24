# Development

## Prerequisites

- Node.js 20+
- Local MongoDB (Docker, `mongod`, or test in-memory helper)

## Setup

```bash
npm install
npm run dev:local            # disposable MongoDB + next dev, nothing to configure
```

`dev:local` boots `mongodb-memory-server`, runs the index, category and migration steps against it, and starts `next dev` with `MONGODB_URI` pointing at it. Extra arguments go to `next dev` (`npm run dev:local -- -p 3100`). The admin password is `local-admin` unless `ADMIN_PASSWORD` is already set. All data is discarded when the process exits.

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

## Preparing a database

1. Start local MongoDB.
2. `MONGODB_URI=mongodb://127.0.0.1:27017/superstition-buster-dev npm run ensure-indexes`
3. `MONGODB_URI=... npm run seed:categories`
4. `MONGODB_URI=... npm run migrate-entries:dry-run`
5. `MONGODB_URI=... npm run migrate-entries`

## Testing

Most tests use `startTestMongo()` (`src/test/mongoServer.ts`), which starts a disposable mongod through `mongodb-memory-server`. The first run downloads the mongod binary into `~/.cache/mongodb-binaries`. Older Wave 1 tests still use the lighter in-memory fake (`src/test/inMemoryMongo.ts`); it does not reproduce real update-operator rules, so prefer the real server for anything that writes.

For local integration against real `mongod`, set `MONGODB_URI` and run migration manually.

## Admin

`ADMIN_PASSWORD` protects `/admin` and `/api/admin/*`. A missing or empty value rejects every login. Do not point these at production data.
