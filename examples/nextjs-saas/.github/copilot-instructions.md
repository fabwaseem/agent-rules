<!-- agentkit-rules:begin header -->
# Copilot instructions

Instructions for coding agents in this repository. Blocks marked `agentkit-rules` are rewritten by [agentkit-rules](https://github.com/fabwaseem/agent-rules). Text outside the markers is left as you wrote it.

## Workspace

- Package manager: `pnpm`. Use it for installs, scripts, and one-off binaries. Do not add a second lockfile or switch package managers.
- A nested AGENTS.md overrides this file for its directory tree.
- Do not hand-edit generated output (`dist/`, `.next/`, coverage, or generated database clients).
- Match the public types and error style of a module you are extending. These rules govern new code; they are not a license for a drive-by rewrite.

## Installed stacks

- `core`: TypeScript, git, security, testing, accessibility, and performance.
- `nextjs`: App Router, Server Components, server actions, and caching.
- `react`: React components, state, and composition.
- `prisma`: Prisma schema, migrations, and client usage.
- `tailwind`: Tailwind CSS v4 tokens and class usage.
- `shadcn`: shadcn/ui composition and the project component source.
<!-- agentkit-rules:end header -->

<!-- agentkit-rules:begin git -->
# Git

- Use Conventional Commits: `type(scope): subject`.
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.
- Subject is imperative, has no trailing period, and stays within 72 characters. The body says why, not a file list.
- One logical change per commit. Do not mix a refactor with a behavior change.
- Branch names look like `fix/session-expiry` or `feat/billing-webhook`.
- Do not commit secrets, `.env` files, `node_modules`, build output, or coverage.
- Do not `git push --force` to a shared branch. Do not `git commit --amend` after the commit is on a remote.
- Do not add `Co-authored-by` or other attribution trailers unless the user explicitly asks.
- Do not skip hooks (`--no-verify`) unless the user explicitly asks.
- Before committing, run the project's typecheck and the tests that cover the change.
- A pull request states what changed, why, and how to verify it. Link the issue when there is one.
- Leave unrelated dirty files untouched. Do not revert user changes you did not make.
<!-- agentkit-rules:end git -->

<!-- agentkit-rules:begin security -->
# Security

- Validate untrusted input at the boundary that receives it: server action, route handler, webhook, or queue consumer. Use the project's schema library, normally Zod. Do not trust client-side checks.
- Authorize on the server from the session or token. Never accept a user id, role, or tenant id from the client as proof of identity.
- Queries use placeholders or the query builder. Do not concatenate untrusted strings into SQL, shell commands, or HTML.
- Secrets come from the environment. Never commit them, log them, or return them. `.env.example` contains names and dummy values only.
- Auth cookies are `HttpOnly`, `Secure`, and `SameSite=Lax` or `Strict`. Do not store access tokens in `localStorage`.
- Cookie-authenticated mutations check the request origin. Do not disable CSRF protection to make a form work.
- Compare secrets and tokens with a timing-safe equality check.
- Production responses include `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a frame policy of `DENY` or `frame-ancestors 'none'`. A content security policy must not allow `unsafe-eval` in production.
- Errors returned to clients are stable codes and messages. Do not send stack traces, SQL, or internal paths.
- Rate-limit authentication, password reset, and public webhooks.
- File uploads check content type and size, use an allow-list of extensions, and are not served from the source directory.
- New dependencies are added to the lockfile with the project's package manager. Do not suggest `--ignore-scripts` as a fix.
<!-- agentkit-rules:end security -->

<!-- agentkit-rules:begin performance -->
# Performance

- Fetch on the server when the data does not depend on browser-only state. Do not move a server read into a client effect to show a spinner.
- Independent reads run with `Promise.all`. Do not `await` them in sequence when neither needs the other's result.
- Do not pass a large object tree into a client component. Pass the fields the component renders.
- In a Next.js app, raster images go through `next/image` with real dimensions or `fill` plus a `sizes` value that matches the layout.
- Load a heavy client-only library with `next/dynamic` or `import()` from the component that needs it. Do not import a charting or editor package from a shared layout.
- Import the icon or function you use. Do not import an entire icon pack from its barrel if the bundler cannot tree-shake it.
- A list that can grow past a page is paginated or virtualized. Do not render an unbounded query.
- Database reads select the columns the screen needs, filter in the database, and use an index for columns in `where`, `join`, and `order by`.
- Do not add `useMemo` or `React.memo` before a measured re-render problem. Do remove work that runs on every keystroke.
- Cache only data that is safe to share. Never cache a response that contains one user's private data under a key that omits the user.
<!-- agentkit-rules:end performance -->

<!-- agentkit-rules:begin paths -->
Path-specific instructions for this install live in `.github/instructions/*.instructions.md`. Copilot applies each file when the active file matches its `applyTo` glob.
<!-- agentkit-rules:end paths -->
