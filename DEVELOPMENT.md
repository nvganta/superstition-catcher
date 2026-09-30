# Development

## Prerequisites

- Node.js 20+
- Local MongoDB (Docker, `mongod`, or test in-memory helper)

## Setup

```bash
npm install
cp .env.example .env.local   # if present
```

Set `MONGODB_URI` to a **local** database only, e.g. `mongodb://127.0.0.1:27017/superstition-buster-dev`.

Scripts refuse URIs matching production patterns (Atlas hostnames, `production`, etc.).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server |
| `npm test` | Vitest unit + integration tests |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run build` | Production build |
| `npm run ensure-indexes` | Create/update MongoDB indexes |
| `npm run seed:categories` | Upsert category taxonomy |
| `npm run migrate-entries:dry-run` | Preview entry migration |
| `npm run migrate-entries` | Upsert entries + v1 versions |

## Wave 1 workflow

1. Start local MongoDB.
2. `MONGODB_URI=mongodb://127.0.0.1:27017/superstition-buster-dev npm run ensure-indexes`
3. `MONGODB_URI=... npm run seed:categories`
4. `MONGODB_URI=... npm run migrate-entries:dry-run`
5. `MONGODB_URI=... npm run migrate-entries`

## Testing

Tests use an in-memory MongoDB-compatible helper (`src/test/inMemoryMongo.ts`) so CI/VM runs never need a live server or Atlas.

For local integration against real `mongod`, set `MONGODB_URI` and run migration manually.

## Admin

`ADMIN_PASSWORD` protects seed/admin routes. Do not point these at production data.
