---
name: local-web-app-smoke-verify
description: Build and start a local web app, health-check key routes with curl, drive critical flows with Playwright, and save screenshot evidence. Use when an agent must prove a branch works before merge or after environment changes.
---

# Local web app smoke verify

End-to-end smoke verification for any locally served web app (Next.js, Vite, static `serve`, etc.). Replace placeholders in **Configuration** before running.

## Configuration

Fill in a short spec (in chat or `references/smoke-spec-template.md`):

| Key | Example | Meaning |
|-----|---------|---------|
| `PROJECT_ROOT` | `.` | Repo root with package.json or build output |
| `BUILD_CMD` | `npm run build` | Optional; skip if using `npm run dev` only |
| `START_CMD` | `npm run start -- -p 3000` | Starts server in foreground or background |
| `BASE_URL` | `http://127.0.0.1:3000` | No trailing slash |
| `READY_PATH` | `/` | Path that must return HTTP 200 when ready |
| `ARTIFACT_DIR` | `./artifacts/screenshots` | Writable directory for PNG evidence |

## Launch

1. From `PROJECT_ROOT`, install deps if needed (`npm ci` or `npm install`).
2. Run `BUILD_CMD` when the app requires a production build.
3. Start the server with `START_CMD`; note the PID or process group.

**Ready gate:**

```bash
curl -sf -o /dev/null -w "%{http_code}\n" "${BASE_URL}${READY_PATH}"
```

Expect `200`. Retry for up to 60s with 2s backoff if the server is slow.

## Doctor (HTTP smoke)

For each route in your spec, run:

```bash
curl -sf -o /dev/null -w "%{http_code}\n" "${BASE_URL}<path>"
```

Document expected status codes (usually `200`). Fail fast on connection errors or `5xx`.

## Drive (browser smoke)

Use Playwright (or MCP browser tools) against `BASE_URL`.

1. **Static or SSR pages** — `page.goto`, assert a unique heading or `data-testid`.
2. **Interactive flows** — click, type, wait for network idle or a visible selector.
3. **Responsive check** — at least one desktop viewport (e.g. 1280×900) and one mobile profile.

Capture screenshots after each major step:

- Filename pattern: `<surface>-<viewport>.png` (e.g. `home-search-desktop.png`).
- Save under `ARTIFACT_DIR`; do not delete artifacts during teardown.

## Evidence checklist

- [ ] Ready gate passed
- [ ] All doctor URLs returned expected codes
- [ ] Each drive step has a screenshot or explicit assertion log
- [ ] Server PID recorded for cleanup

## Cleanup

Stop only the process **you** started for this verification (same port/PID). Do not kill unrelated dev servers.

## References

- `references/smoke-spec-template.md` — copy and fill for a new app
- `references/playwright-minimal.example.ts` — optional one-file Playwright runner
