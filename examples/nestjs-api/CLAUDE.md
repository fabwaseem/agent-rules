<!-- agentkit-rules:begin header -->
# CLAUDE.md

Claude Code loads this file as project memory. The same constraints are written to AGENTS.md for other agents. When a task is a procedure, invoke the matching skill under `.claude/skills` instead of improvising the steps.

- Do not widen permissions, skip hooks, or disable tests to get a change through.
- Ask before destructive git, a production deploy, or a migration that drops or rewrites data.
- After a code change, run typecheck and the narrowest test that covers it.

Instructions for coding agents in this repository. Blocks marked `agentkit-rules` are rewritten by [agentkit-rules](https://github.com/fabwaseem/agent-rules). Text outside the markers is left as you wrote it.

## Workspace

- Package manager: `npm`. Use it for installs, scripts, and one-off binaries. Do not add a second lockfile or switch package managers.
- A nested AGENTS.md overrides this file for its directory tree.
- Do not hand-edit generated output (`dist/`, `.next/`, coverage, or generated database clients).
- Match the public types and error style of a module you are extending. These rules govern new code; they are not a license for a drive-by rewrite.

## Installed stacks

- `core`: TypeScript, git, security, testing, accessibility, and performance.
- `node`: Node.js configuration, process lifecycle, and service errors.
- `nestjs`: NestJS modules, validation, and HTTP boundaries.
- `drizzle`: Drizzle schema, migrations, and query safety.
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

<!-- agentkit-rules:begin typescript -->
# TypeScript

- `strict` stays on. Do not weaken `tsconfig` to make a file compile.
- Do not use `any`. Use `unknown` and narrow it. A third-party type that is `any` gets wrapped at the boundary.
- Do not silence the compiler with `@ts-ignore`. `@ts-expect-error` requires a reason on the same line and a comment that says which upgrade removes it.
- Do not use a non-null assertion (`!`) unless the next line comments the invariant that makes it safe.
- Prefer `type` for unions, props, and inferred shapes. Use `interface` when a consumer is expected to extend the object.
- Use `import type` for type-only imports. Do not import a runtime value only to use it as a type.
- Do not add TypeScript `enum`. Use a string union or an `as const` object plus a derived type.
- Switches over a union end in a `never` check so a new variant fails compilation.
- Named exports are the default. A default export is only for a file the framework requires (`page`, `layout`, `route`, `error`, `loading`, `not-found`).
- Zod schemas (or the project's equivalent) are the runtime source of truth. Derive the static type with `z.infer`.
- Do not leave a floating promise. `await` it, return it, or `void` it with a comment that says why the result is intentionally discarded.
- Throw `Error` subclasses for exceptional failures. For expected failures, return a discriminated union such as `{ ok: true, data: T } | { ok: false, error: string }`. Do not throw strings.
- Public functions whose inferred return type is a wide object or a `Promise` the caller must branch on get an explicit return type.
- Use the path alias already in `tsconfig`. Do not add a second one.
- Keep a module on one subject. Split a file that mixes I/O, domain rules, and rendering.
<!-- agentkit-rules:end typescript -->

<!-- agentkit-rules:begin testing -->
# Testing

- Use Vitest for unit and component tests. Use Testing Library for React. Use Playwright only when the repo already has it. Do not add a second test runner.
- Test behavior a caller can observe. Do not assert private function names, call counts, or implementation order.
- The test name states the behavior and the condition: "rejects a second session for the same user".
- Query UI by role, label, or text. Do not query by class name or DOM structure.
- Cover the failure path for the change: invalid input, unauthenticated, forbidden, and not found, when those states exist.
- Mock at the network or module boundary. Do not mock the function under test.
- Unit tests do not call the network, a real database, or the real clock. Integration tests that do are named as such and clean up after themselves.
- Do not add a snapshot as the only assertion for logic or markup. A snapshot is acceptable for stable serialized output such as a migration plan.
- Build data with a small factory. Do not copy a 50-line fixture between files.
- Place the test next to the code (`feature.test.ts`) or in the folder the repo already uses. Do not invent a third layout.
- While iterating, run the single test file. Before handing work back, run the suite the CI job runs for that area.
- Do not weaken an assertion or skip a test to make it pass. Fix the code or explain the product change in the test name.
<!-- agentkit-rules:end testing -->

<!-- agentkit-rules:begin accessibility -->
# Accessibility

- Target WCAG 2.2 AA. Use a native element before an ARIA role: `button`, `a`, `input`, `nav`, `main`, `label`.
- Heading levels follow the page outline. Do not skip from `h1` to `h3` because of size. Size comes from CSS.
- Every input has a visible label associated by `htmlFor` / `id` or a wrapping `label`. A placeholder is not a label.
- Every interactive control has an accessible name. An icon-only button has `aria-label`.
- Keyboard users can reach, operate, and leave the control. Focus is visible. Do not remove `outline` without a replacement focus style.
- A dialog has an accessible name, moves focus inside, traps focus, and closes on Escape, restoring focus to the opener.
- An image that carries meaning has `alt`. A decorative image has `alt=""`.
- Do not use color as the only way to convey state. Pair it with text or an icon that has a name.
- A status that appears after a submit uses an alert or `aria-live` region when the user is not moved to the message.
- Respect `prefers-reduced-motion`. Do not autoplay motion that the user cannot stop.
- Do not attach `onClick` to a `div` or `span`. Use a button, or an anchor when navigation happens.
<!-- agentkit-rules:end accessibility -->

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

<!-- agentkit-rules:begin node-runtime -->
# Node.js

- Target the Node version in `engines` or `.nvmrc`. Do not use an API that version does not have.
- The package is ESM when `"type": "module"` is set. Do not add `require` in an ESM file. Use `createRequire` only at a boundary that loads a CommonJS dependency.
- Validate environment variables once at startup with Zod and fail the process if any are missing. Do not scatter `process.env` reads through business logic.
- A long-running server handles `SIGTERM` and `SIGINT`: stop accepting connections, finish in-flight work, close the database pool, then exit.
- Do not call `process.exit` inside request handling. Throw or return an error and let the boundary map it.
- Operational logs are structured and include a stable event name. Do not log secrets, cookies, authorization headers, or full request bodies.
- Expected failures carry a `code` string the caller can branch on. Unexpected failures stay as `Error` with the original cause attached (`{ cause }`).
- Set `trust proxy` only when the process is actually behind a known proxy. Do not trust `X-Forwarded-*` from the open internet.
- Bound request body size and outbound request timeouts. Do not leave a `fetch` without a timeout on a user-facing path.
- Scripts that mutate data are idempotent or refuse to run twice. Print a dry-run mode before a destructive script.
<!-- agentkit-rules:end node-runtime -->

<!-- agentkit-rules:begin nestjs -->
# NestJS

- A feature is a module: `*.module.ts`, a controller, a service, and DTOs. Register providers in that module. Do not declare a provider in `AppModule` because it is convenient.
- Controllers translate HTTP. Services hold business rules. Database calls live in the service or a repository the service injects. A controller does not import Prisma or Drizzle directly.
- DTOs are classes or Zod schemas validated before the handler runs. A global `ValidationPipe` uses `whitelist: true` and `forbidNonWhitelisted: true` when the project uses class-validator.
- Do not read `process.env` inside a service. Inject `ConfigService` from a module that already validated the environment.
- Authentication is a guard. Authorization that depends on the resource happens in the service, after the guard has attached the user. Do not parse the cookie by hand in each controller.
- Use the project's `@CurrentUser()` decorator, or add one, instead of repeating `@Req() req` and casting `req.user`.
- Throw `HttpException` subclasses (or the project's domain error mapped by an exception filter). Do not return `{ status: 500, message: error.message }` from a controller.
- Interceptors are for cross-cutting response mapping and timing, not for business rules.
- Tests build a `TestingModule`, mock the next boundary (repository or external HTTP), and assert the HTTP status plus the response body. Do not boot the whole application for a unit test.
- Keep `main.ts` limited to global pipes, filters, versioning, and shutdown hooks. Feature wiring belongs in modules.
<!-- agentkit-rules:end nestjs -->

<!-- agentkit-rules:begin drizzle -->
# Drizzle

- Define tables in TypeScript with the `drizzle-orm` builders the repository already imports. Do not start a second schema style in the same project.
- Generate migrations with `drizzle-kit generate` and commit the SQL. Apply them with `drizzle-kit migrate`.
- `drizzle-kit push` is for a local prototype. Do not point it at a shared database.
- Do not edit a migration that has already been applied. Add a new one.
- Share one database client. Do not call `drizzle()` inside a request handler.
- Use the query builder or the `sql` tagged template with bound parameters. Do not build SQL by concatenating untrusted input.
- Casts and `sql.raw` are limited to identifiers that do not come from user input, and the line comments why.
- Transactions wrap multi-step writes that must commit or roll back together.
- Indexes cover columns used in filters, joins, and ordering. Add the index in the schema so the next migration creates it.
- Do not import the database client into a Client Component.
- A migration that drops a column or deletes rows is called out before it runs.
<!-- agentkit-rules:end drizzle -->
