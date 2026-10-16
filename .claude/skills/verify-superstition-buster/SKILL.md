---
name: verify-superstition-buster
description: Launch the Superstitions Buster Next.js app, smoke-test entry pages, explore, and search, and save screenshot evidence.
---

# Verify Superstition Buster

## Launch

```bash
cd /workspace && npm run build && npm run start -- -p 3000
```

Ready when `curl -sf http://127.0.0.1:3000/` returns 200. Teardown: stop the process listening on port 3000 (the one you started).

## Doctor

```bash
curl -sf -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000/explore
```

Expect `200`.

## Drive

1. Entry detail: `GET /superstition/<id>` — body contains entry `title`.
2. Explore region: open `/explore`, select **Americas**, confirm card for the entry id.
3. Search: on `/`, type at least two characters in the search input; dropdown lists matching entries from `searchSuperstitions`.

Use Playwright against `http://127.0.0.1:3000` for screenshots (1280×900 desktop and iPhone 13 profile).

## Evidence

Save PNGs under `/opt/cursor/artifacts/screenshots/` named by surface (`pulling-the-sun-detail-desktop.png`, etc.). Do not delete artifacts during cleanup.

## Cleanup

Stop only the Next.js server started for verification.
