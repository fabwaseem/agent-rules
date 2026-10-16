# Contributing

Thanks for improving the pack. The useful change is a rule an agent can follow without guessing, or an installer bug with a test.

## Setup

```bash
npm install
npm test
npm run validate
```

Node.js 20.19 or newer is required.

## Change a rule

1. Edit `rules/<stack>/*.mdc` or `rules/<stack>/skills/<name>/SKILL.md`.
2. Register new files in `rules/index.json`. Keep the stack order.
3. Cursor frontmatter is `description`, `globs`, and `alwaysApply` only. `globs` is a single comma-separated string. Leave `globs` off when `alwaysApply` is true.
4. Skill frontmatter is `name` and `description` only. `name` matches the directory.
5. Run `npm run examples` so `examples/` matches the installer.
6. Run `npm run validate` and `npm test`.

Do not edit generated files under `examples/` by hand. Do not duplicate a rule body in a second format. The installer renders AGENTS.md, CLAUDE.md, Copilot, Windsurf, and Devin from the `.mdc` files.

## Commits

Use a Conventional Commit (`feat:`, `fix:`, `docs:`). Do not add `Co-authored-by` trailers.

## Publish

Publishing is a maintainer step. See the README. Do not bump the version in an unrelated change.
