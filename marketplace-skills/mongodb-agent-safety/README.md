# MongoDB agent safety

Cloud agents and local coding agents routinely run migrations, seeds, and integration tests. One wrong `MONGODB_URI` can wipe or corrupt production data. This skill encodes **fail-closed URI checks**, a preferred local/in-memory stack, and a dry-run-first workflow so agents stop before connecting to shared clusters.

## Install

```bash
cp -R mongodb-agent-safety ~/.cursor/skills/
# or ~/.claude/skills/ or .agents/skills/
```

Optionally wire `scripts/assert-safe-mongo-uri.mjs` into npm `premigrate` hooks or CI guard steps.

## License

Select a license before marketplace listing (MIT/Apache-2.0 are typical). No LICENSE file is bundled here.
