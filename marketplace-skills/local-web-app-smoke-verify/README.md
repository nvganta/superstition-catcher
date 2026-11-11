# Local web app smoke verify

Agents often need more than unit tests: a running server, real HTTP, and visual proof. This skill standardizes **launch → ready gate → curl doctor → Playwright drive → screenshot evidence → targeted cleanup** so verification is repeatable across repos and CI-like environments.

## Install

Copy the folder into your agent skills directory (keep `SKILL.md` and `references/` together):

```bash
cp -R local-web-app-smoke-verify ~/.cursor/skills/
# or
cp -R local-web-app-smoke-verify ~/.claude/skills/
# or
cp -R local-web-app-smoke-verify .agents/skills/
```

Point the agent at the skill name `local-web-app-smoke-verify` when you need post-change smoke verification with artifacts.

## License

Choose a license that fits your marketplace (MIT and Apache-2.0 are common for tooling skills). This package does not include a LICENSE file; the publisher should add one before distribution.
