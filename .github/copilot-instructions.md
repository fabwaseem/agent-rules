# Copilot instructions

This repository is the agentkit-rules pack, not a Next.js application.

- Edit rule bodies in `rules/<stack>/*.mdc` and register them in `rules/index.json`.
- Cursor files use `description`, `globs`, and `alwaysApply`. Skill files use `name` and `description`.
- Regenerate `examples/` with `npm run examples`. Do not patch example output by hand.
- Run `npm run validate` and `npm test`.
- Conventional Commits. No `Co-authored-by` trailers unless the user asks.
