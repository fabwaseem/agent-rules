# AGENTS.md

This repository publishes [agentkit-rules](https://github.com/fabwaseem/agent-rules), a modular pack of coding-agent instructions.

## Workspace

- Package manager: `npm`. Use it for install, test, and the local CLI.
- Rule bodies live in `rules/`. `rules/index.json` is the catalog.
- `src/cli.ts` copies selected stacks into AGENTS.md, CLAUDE.md, `.cursor/rules`, GitHub Copilot instructions, Claude Code skills, and Windsurf / Devin rules.
- Do not edit `examples/` by hand. Run `npm run examples` so the snapshot stays aligned with the installer.
- Run `npm run validate` and `npm test` after a change.
- Commits use Conventional Commits. Do not add `Co-authored-by` trailers.
