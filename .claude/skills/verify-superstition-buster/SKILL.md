---
name: verify-superstition-buster
description: Launch the Superstitions Buster Next.js app against a disposable MongoDB, smoke-test entry pages, explore, categories, search, posting and admin, and save screenshot evidence.
---

# Verify Superstition Buster

## Launch

```bash
npm run dev:local -- -p 3100
```

This starts `mongodb-memory-server`, runs ensure-indexes, seeds categories, migrates the 43 seed entries, then runs `next dev`. Ready when the log prints `Ready in`. The admin password is `local-admin`. Never point `MONGODB_URI` at a real database for verification.

Teardown: stop the `dev:local` process you started, plus its `next` and `mongod` children. Find them by the port you chose and kill by PID only.

## Doctor

```bash
curl -sf -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3100/explore
```

Expect `200`.

## Drive

1. Entry detail: `GET /superstition/<id>`. Body contains the entry `title` and the new-model sections.
2. Explore region: open `/explore`, select **India**, confirm cards appear.
3. Category: open `/categories`, click a life area, land on `/categories/<slug>`.
4. Search: on `/`, type at least two characters. `pungent` should return only `lemons-chillies-door`, which proves the text index covers `whyItStarted`.
5. Post: fill `/post`. A phone number or email is held with a field message, a slur is blocked without echoing it, a clean post redirects to the live entry, and a second post within 30s shows a wait message.
6. Admin: log in at `/admin`, create a curated entry (confidence and a source required), edit it, and see the version bump.

Use Playwright against `http://127.0.0.1:3100` for screenshots (1280×900 desktop and a 390px mobile viewport).

## Evidence

Save PNGs to a scratch folder named by surface (`04-detail-lemons.png`, etc.). Do not delete artifacts during cleanup.

## Cleanup

Stop only the processes started for verification. The database is discarded with them.
