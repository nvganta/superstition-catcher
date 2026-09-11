<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- repository-guide:start -->
## Repository operating guide

Read README.md, LOG.md and FOUNDER.md first, then ARCHITECTURE.md and ROADMAP.md. Existing detailed product and verification instructions in this repository still apply.

### Working area

src/app: Next.js pages and API routes; src/lib: content/database helpers; MongoDB persists community content; Anthropic supports optional origin research.

### Setup and checks

Use [DEVELOPMENT.md](DEVELOPMENT.md) for the exact package directories and commands. Inspect package manifests before running commands. Use the existing lockfile; do not switch package managers or regenerate locks incidentally. Run checks appropriate to changed behavior and report failures honestly. A documentation check is not a product acceptance test.

### Boundaries

Keep generated origin research distinct from established evidence. ANTHROPIC_API_KEY is optional for the rest of the app. Do not call seed or admin mutation endpoints against real data during routine checks.

Preserve pre-existing user changes. Never put credentials, personal data, local databases or generated build output in commits. Do not run paid-provider calls, publish, deploy, push, or mutate real service data without task authorization.

### Compass handoff

Keep root LOG.md and FOUNDER.md. Under `## Status`, keep one-line bullets named `State`, `Live URL`, `Stranger test`, `Currently working on`, and `Blocked on investor`. Use state `active`, `parked`, or `dormant` according to product activity, not the age of a documentation edit. Use `nothing` when no user decision or input is required; engineering work belongs in current work/roadmap.

Before ending meaningful work, update status and prepend a `- YYYY-MM-DD: ...` entry under `## Session notes`, newest first. Include the change, checks actually run, and remaining work. Preserve historical entries and decisions. Never record secrets or personal transcripts in this file.
<!-- repository-guide:end -->
