# Development

## Scope and prerequisites

Keep generated origin research distinct from established evidence. ANTHROPIC_API_KEY is optional for the rest of the app. Do not call seed or admin mutation endpoints against real data during routine checks.

Commands below run from the repository root unless a `cd` is shown. Install the runtime required by the package manifest. For Node projects, preserve package-lock.json with `npm ci`; Quiet Orbit uses its pnpm lockfile; the voice service uses uv.lock. Installation may require network access.

## Commands

```text
npm ci
npm run dev
# Verification
npm run lint
npm run build
```

These commands come from the current manifests; they are not a claim that all checks passed during documentation setup. Check LOG.md for dated results. Builds may require configuration, downloads or external services.

## Configuration

Configuration shape: `.env.example`. See the comments about which process loads these variables.

Use dummy examples for configuration shape only; supply real credentials outside version control. Client-prefixed variables are public. Export environment variables explicitly when the app has no dotenv loader.

## Source map

src/app: Next.js pages and API routes; src/lib: content/database helpers; MongoDB persists community content; Anthropic supports optional origin research.

## Next verification

Verify community submission and admin review with a development database, then evaluate research drafts before making them public.

## Repository check

`python scripts/check_repository.py` checks the documentation contract and tracked local-secret filenames. GitHub Actions runs this baseline check; it does not certify runtime or deployment readiness.

## PR scope note

This PR contains the repository setup and any explicitly listed consolidation changes. Other local feature work was excluded. LOG.md preserves local historical observations; those observations do not establish that this PR includes or verifies every feature mentioned there. Consult the PR description for its exact scope.
