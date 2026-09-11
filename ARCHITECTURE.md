# Architecture

src/app: Next.js pages and API routes; src/lib: content/database helpers; MongoDB persists community content; Anthropic supports optional origin research.

## Constraints

Keep generated origin research distinct from established evidence. ANTHROPIC_API_KEY is optional for the rest of the app. Do not call seed or admin mutation endpoints against real data during routine checks.

## Detailed references

See [DEVELOPMENT.md](DEVELOPMENT.md) for current package commands and configuration.

This is an orientation map of the current source, not proof that every integration works.
