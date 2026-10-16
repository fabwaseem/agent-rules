# agentkit-rules

Modular, production-grade instructions for AI coding agents. Pick the stacks you actually use. The installer writes each tool's current file format.

Stacks: **TypeScript**, **Next.js** (App Router, server actions, caching), **React**, **Node.js**, **NestJS**, **Prisma**, **Drizzle**, **Tailwind CSS**, **shadcn/ui**.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE) ![Node >= 20.19](https://img.shields.io/badge/node-%3E%3D20.19-339933) ![Formats](https://img.shields.io/badge/formats-AGENTS.md%20%7C%20CLAUDE.md%20%7C%20Cursor%20%7C%20Copilot%20%7C%20Skills%20%7C%20Windsurf-8b5cf6)

One source of truth for your coding agents' rules, rendered into every format: `AGENTS.md`, `CLAUDE.md`, Cursor `.mdc`, GitHub Copilot instructions, Claude Code skills, and Windsurf / Devin rules.

Write-up: [AGENTS.md vs CLAUDE.md vs Cursor rules: a Next.js guide](https://www.fabwaseem.com/blog/agents-md-vs-claude-md).

## Quick start

Option 1, run the installer from a clone (Node 20.19+):

```bash
git clone https://github.com/fabwaseem/agent-rules.git
cd agent-rules && npm install && npm run build
# install into your project
node dist/cli.js --target ../my-app
```

Option 2, copy files by hand. Every rendered format is committed under [`examples/`](examples). Copy `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/`, `.github/`, `.claude/skills/` or `.devin/rules/` from the example closest to your stack.

Option 3, `npx agentkit-rules`: **coming soon**. The package is not on npm yet. Until then, replace `npx agentkit-rules` in the commands below with `node /path/to/agent-rules/dist/cli.js`.

## What gets written

One `.mdc` file is the source for a rule. The installer renders the other formats from it, so they do not drift.

| You ask for | Files | When the tool loads them |
| --- | --- | --- |
| `agents` | `AGENTS.md` | Nearest file in the directory tree. Plain Markdown. No required fields. |
| `claude` | `CLAUDE.md` | Claude Code project memory for that directory. |
| `cursor` | `.cursor/rules/*.mdc` | `alwaysApply`, a matching `globs` pattern, a relevant `description`, or an `@` mention. |
| `copilot` | `.github/copilot-instructions.md` and `.github/instructions/*.instructions.md` | The root file is repository-wide. Each `*.instructions.md` applies when `applyTo` matches. |
| `skills` | `.claude/skills/<name>/SKILL.md` | Claude Code loads the body when the description matches, or when you run `/name`. |
| `windsurf` | `.windsurf/rules/*.md` and `.devin/rules/*.md` | `trigger` is `always_on`, `glob`, `model_decision`, or `manual`. `.devin/rules` is the preferred current path. `.windsurf/rules` is the still-supported fallback. The same file is written to both. |

`AGENTS.md`, `CLAUDE.md`, and `copilot-instructions.md` are merged documents with `<!-- agentkit-rules:begin ... -->` markers. Re-running the installer updates those blocks and leaves text outside them alone. Cursor rules, skills, Windsurf rules, and path-specific Copilot files are separate files, so a tool that understands globs does not have to carry every stack in every conversation.

## AGENTS.md vs CLAUDE.md vs Cursor rules

Checked against [agents.md](https://agents.md/), [Cursor Rules](https://cursor.com/docs/rules), [Claude Code skills](https://code.claude.com/docs/en/skills), [GitHub Copilot repository instructions](https://docs.github.com/en/copilot/how-tos/configure-custom-instructions/add-repository-instructions), and [Windsurf / Devin rules](https://docs.devin.ai/desktop/cascade/memories).

| | AGENTS.md | CLAUDE.md | Cursor `.mdc` | Copilot instructions | Claude skill | Windsurf / Devin |
| --- | --- | --- | --- | --- | --- | --- |
| Path | `AGENTS.md`, nested files allowed | `CLAUDE.md` | `.cursor/rules/*.mdc` | `.github/copilot-instructions.md`, `.github/instructions/*.instructions.md` | `.claude/skills/<name>/SKILL.md` | `.devin/rules/*.md` (preferred), `.windsurf/rules/*.md` |
| Frontmatter | None. Standard Markdown. | None. | `description`, `globs`, `alwaysApply` | Root file: none. Path file: `applyTo` | `name`, `description` | `trigger`, plus `globs` or `description` |
| Scope | Whole tree, nearest file wins | Claude Code | Always, glob, agent-selected, or manual | Repository-wide, or files matching `applyTo` | On demand | Always, glob, model decision, or `@` mention |
| Use it for | Rules every agent should share | Claude-specific reminders on top of those rules | Constraints that should attach to certain files | Copilot Chat, code review, and the cloud agent | A multi-step procedure | Cascade / Devin workspace rules |

Cursor ignores a `.md` file inside `.cursor/rules`. The extension has to be `.mdc`. A rule with `alwaysApply: true` is included every session. `alwaysApply: false` plus `globs` attaches when a matching file is in context. `alwaysApply: false` plus a `description` and no globs is pulled in when the agent decides the description is relevant. With neither, the rule loads only if you `@` mention it.

Claude Code skills follow the Agent Skills format. `name` is 1–64 characters of lowercase letters, numbers, and hyphens, and it must not contain `anthropic` or `claude`. `description` is how the model decides to load the skill. This pack keeps procedures in skills and constraints in the `.mdc` rules.

Windsurf workspace rules are capped at 12,000 characters. Each file in this pack stays under that. Global Windsurf rules (`~/.codeium/windsurf/memories/global_rules.md`) are a different 6,000-character file and are not written by the installer.

## Install

From the built clone, point `--target` at your project (or run it from inside the project):

```bash
node /path/to/agent-rules/dist/cli.js --target .
```

On a terminal, the CLI shows the stacks it detected and lets you accept or replace them. Detection reads `package.json` and `components.json`.

| Signal | Stack |
| --- | --- |
| always | `core` |
| `next` | `nextjs` and `react` |
| `react` or `react-dom` | `react` |
| `@nestjs/core`, `express`, `fastify`, `hono`, `koa` | `node` |
| `@nestjs/core` | `nestjs` |
| `prisma` or `@prisma/client` | `prisma` |
| `drizzle-orm` | `drizzle` |
| `tailwindcss`, `@tailwindcss/postcss`, or `@tailwindcss/vite` | `tailwind` |
| `shadcn`, `@shadcn/react`, `@base-ui/react`, `@radix-ui/*`, or `components.json` | `shadcn` |

Non-interactive (shown with the future `npx` name; use the clone command above for now):

```bash
npx agentkit-rules --yes
npx agentkit-rules --stacks core,nextjs,prisma,tailwind,shadcn --agents cursor,agents,claude
npx agentkit-rules --target ../my-app --dry-run
npx agentkit-rules list
npx agentkit-rules validate
```

`--yes` accepts the detected stacks and every format. `--force` backs up an unmanaged `AGENTS.md`, `CLAUDE.md`, or `copilot-instructions.md` to `*.bak` and replaces it. A second run updates the marked blocks in place and drops sections for stacks you leave out. Individual Cursor, Copilot, skill, and Windsurf files from a stack you later omit stay on disk until you delete them.

The package manager named in the generated header comes from the `packageManager` field, then the lockfile.

## What the rules argue for

These are opinions. They match current framework defaults, and they say so when a call depends on the installed major version.

- **TypeScript.** `strict` stays on. No `any`, no `enum`, no floating promises. Zod is the runtime source of truth.
- **Git.** Conventional Commits, small commits, no force-push of shared branches, no `Co-authored-by` trailer unless you ask.
- **Security.** Validate and authorize on the server. Parameterized queries. `HttpOnly` cookies. No secrets in logs or responses.
- **Testing.** Vitest and Testing Library. Test behavior, including the failure path. Do not add a second runner.
- **Accessibility.** WCAG 2.2 AA. Native elements, visible labels, keyboard focus, named dialogs.
- **Performance.** Server-render data, parallelize independent reads, paginate unbounded lists, do not cache one user's private data under a shared key.
- **Next.js.** App Router only. Server Components by default. `params` are promises. Next.js 16 request interception is `proxy.ts`. Server actions validate with Zod, authorize inside the action, and return a result object. `updateTag` is for read-your-writes. On Next.js 16, `revalidateTag` takes a cacheLife profile. `"use cache"` is used only when `cacheComponents` is already enabled.
- **React.** Composition, derived state, `ref` as a prop on React 19.
- **Node.js.** Validate the environment once at startup. Handle `SIGTERM`. Timeouts on outbound calls.
- **NestJS.** Feature modules. Thin controllers. Whitelist validation. Guards for auth.
- **Prisma.** Follow the installed major. Prisma 7+ keeps the URL in the config file and requires a driver adapter. Migrate with a new migration. Generate the client. One client per process.
- **Drizzle.** Schema in TypeScript. `drizzle-kit generate` then `migrate`. Bound parameters only.
- **Tailwind.** v4 `@import "tailwindcss"` and `@theme` tokens. `cn()` for conditional classes.
- **shadcn/ui.** `components/ui` is source you own. Base UI uses `render`. Radix uses `asChild`. Semantic colors. Compose the pieces the CLI added.

## Examples

Committed installer output, not applications:

- [examples/nextjs-saas](examples/nextjs-saas) — Next.js, React, Tailwind, shadcn, Prisma
- [examples/nestjs-api](examples/nestjs-api) — NestJS, Node.js, Drizzle

## Layout

```text
rules/<stack>/*.mdc                 source rules
rules/<stack>/skills/<name>/SKILL.md
rules/index.json                    catalog
src/                                installer and validator
examples/                           rendered output
.github/workflows/ci.yml            validates frontmatter, runs tests, builds
```

## Development

```bash
npm install
npm test
npm run validate
npm run build
npm run examples
```

CI runs validation, the test suite, and `tsc`. The validator checks Cursor keys, Copilot `applyTo`, skill `name` / `description`, and Windsurf `trigger`, including the 12,000-character workspace limit.

## Publishing

This package is ready to publish and is not on npm yet. `prepublishOnly` validates, tests, and builds.

```bash
npm whoami
npm publish
```

`publishConfig.access` is `public`. If `agentkit-rules` is taken by the time you publish, rename the package to `@fabwaseem/agent-rules` and publish with public access. No npm token is stored in this repository.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). The short version: change `rules/`, register the file, regenerate examples, run `npm test` and `npm run validate`.

## License

[MIT](LICENSE) © 2026 Waseem Anjum
