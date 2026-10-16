<!-- agentkit-rules:begin header -->
# CLAUDE.md

Claude Code loads this file as project memory. The same constraints are written to AGENTS.md for other agents. When a task is a procedure, invoke the matching skill under `.claude/skills` instead of improvising the steps.

- Do not widen permissions, skip hooks, or disable tests to get a change through.
- Ask before destructive git, a production deploy, or a migration that drops or rewrites data.
- After a code change, run typecheck and the narrowest test that covers it.

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

<!-- agentkit-rules:begin nextjs-app-router -->
# Next.js App Router

- New UI goes in the App Router. Do not add a `pages/` route.
- Components are Server Components by default. Add `"use client"` only on the leaf that needs state, effects, or browser APIs. Do not mark a layout as a client component to satisfy one button.
- Read `params` and `searchParams` as promises and `await` them. Do not type them as plain objects on Next.js 15 or later.

```tsx
export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  return <article>{id}</article>
}
```

- A route segment uses the framework files: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`. `error.tsx` is a client component because it uses an error boundary.
- Set document metadata with the Metadata API. Do not add `next/head`.
- Navigate with `next/link`. A raw `<a>` is for external URLs only.
- Load fonts with `next/font`. Do not add a render-blocking stylesheet from a CDN.
- Import `server-only` in modules that read secrets or talk to the database, so a client import fails the build.
- Do not pass a database row, a secret, or a server function closure into a client component. Pass serializable props.
- On Next.js 16, request interception lives in `proxy.ts` and exports `proxy`. Do not add a new `middleware.ts` beside it. Keep the matcher narrow.
- Do not read `cookies()` or `headers()` in a layout that should stay static unless that layout truly depends on the request.
- Environment variables used in the browser must start with `NEXT_PUBLIC_`. Everything else stays on the server.
- Do not flip `cacheComponents` on as a drive-by. It changes rendering: uncached I/O outside `<Suspense>` fails the build.
<!-- agentkit-rules:end nextjs-app-router -->

<!-- agentkit-rules:begin nextjs-data -->
# Server actions, route handlers, and caching

- A file that starts with `"use server"` exports async functions only. Keep the action next to the feature that calls it.
- Validate arguments with Zod `safeParse`. Return field errors for invalid input. Do not throw the raw `ZodError` to the client.
- Check authentication and authorization inside the action. The user id comes from the session, never from the form payload.
- Return a discriminated result the form can render: `{ ok: true } | { ok: false, error: string, fieldErrors?: Record<string, string> }`.
- After a mutation the user must see immediately, call `updateTag(tag)` from `next/cache`. `updateTag` runs only inside a Server Action.
- On Next.js 16, `revalidateTag` takes a cacheLife profile as the second argument. Prefer `revalidateTag(tag, "max")` when stale-while-revalidate is acceptable. Do not call the one-argument form on Next.js 16. On Next.js 15 the one-argument form is still the API. Read the installed `next` version before choosing.
- Use `revalidatePath` when a whole route must refresh and the data is not tagged.
- A route handler (`route.ts`) is for webhooks, third-party callbacks, and non-HTML responses. Do not use a route handler for a mutation the UI can perform with a server action.
- `fetch` is not cached by default. Do not add `cache: "force-cache"` unless you also have an invalidation story.

When `cacheComponents` is enabled in `next.config`:

- Mark a cacheable async function or component with `"use cache"`.
- Call `cacheLife` inside that scope. Prefer a built-in profile (`"minutes"`, `"hours"`, `"days"`, `"max"`) so the lifetime is visible at the call site.
- Call `cacheTag` inside the same scope for every entity the function returns, so a mutation can invalidate it.
- Do not read `cookies()` or `headers()` inside the cached scope. Read them outside and pass the values you need as arguments.
- A cached function must not return one user's private data under a tag that omits that user.
- Wrap uncached I/O in `<Suspense>` so the static shell can still prerender.

```tsx
import { cacheLife, cacheTag } from "next/cache"

export async function getPublishedPosts() {
  "use cache"
  cacheLife("hours")
  cacheTag("posts")
  return db.post.findMany({ where: { published: true } })
}
```

- Do not introduce `"use cache"` in a project that has not enabled `cacheComponents`.
<!-- agentkit-rules:end nextjs-data -->

<!-- agentkit-rules:begin react-components -->
# React

- Function components only. Do not add a class component.
- On React 19, `ref` is a normal prop. Do not wrap a new component in `forwardRef`.
- Name the component and the file the same. Export it as a named export unless the framework file requires a default export.
- Props that change together become one object. A component with more than a handful of boolean mode flags should be split or composed.
- Prefer composition. Pass `children` or a render slot instead of threading data through components that do not use it.
- Derive values during render. Do not copy props into state with `useEffect` or `useState` just to display them.
- `useEffect` synchronizes with an external system. It is not a data-fetching tool when a Server Component or a loader can fetch.
- Do not call `use` to start a new client-side fetch when the page can read the data on the server.
- Event handlers are `handleX` inside the component and `onX` in props.
- List keys are stable ids from the data. Do not use the array index when the list can reorder, filter, or insert.
- State lives at the lowest component that needs it. Do not lift state into a provider for one screen.
- A custom hook starts with `use`, names the behavior, and does not render JSX.
- Do not disable the React Compiler, `eslint-plugin-react-hooks`, or a rules-of-hooks warning to make a line work. Restructure the component.
<!-- agentkit-rules:end react-components -->

<!-- agentkit-rules:begin prisma -->
# Prisma

- Read the installed Prisma major and follow it. Prisma 7 and later keep the connection URL in `prisma.config.ts` (7.10+ also discovers `prisma7.config.ts`). Do not put `url = env("DATABASE_URL")` back on the `datasource` block for those versions.
- The generator uses `provider = "prisma-client"` and an explicit `output`. Import `PrismaClient` from that output. Do not guess a second import path.
- Prisma 7 requires a driver adapter. `new PrismaClient()` without an `adapter` throws. Construct one client per process and cache it on `globalThis` outside production so dev reload does not exhaust connections.

```ts
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../generated/prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const globalForPrisma = globalThis as typeof globalThis & { prisma?: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

- Replace the import and adapter with the ones this repository already uses.
- Do not call `$disconnect()` at the end of a serverless request.
- Schema changes ship as migrations. Locally: `prisma migrate dev`. Production and CI: `prisma migrate deploy`. Then `prisma generate`. On Prisma 7, migrate and `db push` do not regenerate the client.
- Do not edit a migration that has already been applied to a shared database. Add a new migration.
- `db push` is for a local prototype only. Do not use it against a shared database.
- Multi-step writes that must succeed or fail together use `prisma.$transaction`.
- Select the fields the caller needs. Do not `include` a relation graph a component will not render.
- Do not import Prisma Client into a Client Component or any file marked `"use client"`.
- A migration that drops a column, table, or data is called out and confirmed before it runs.
<!-- agentkit-rules:end prisma -->

<!-- agentkit-rules:begin tailwind -->
# Tailwind CSS

- This pack assumes Tailwind v4. The CSS entry uses `@import "tailwindcss";`. Do not add `@tailwind base` directives to a v4 file.
- Design tokens live in `@theme` in CSS. When the repo still has `tailwind.config.ts`, extend that file instead of creating a second source of color and spacing.
- Use the spacing, color, and radius tokens already on the screen. An arbitrary value (`p-[13px]`, `bg-[#123456]`) is a last resort and only when no token fits.
- Responsive styles are mobile-first. The unprefixed class is the small screen. `md:` and `lg:` override it.
- Prefer `flex` with `gap-*` over `space-x-*` and `space-y-*`.
- Use `size-*` when width and height are equal.
- Conditional classes go through the project's `cn()` helper (usually `clsx` plus `tailwind-merge`). Do not build a class string with a ternary that can emit conflicting utilities.
- When colors are semantic (`bg-background`, `text-muted-foreground`), do not add a manual `dark:` color that fights the token.
- Do not restyle a third-party component by reaching into its DOM with complex selectors. Pass a `className` at the slot the component exposes.
- Do not reorder every class in a file you are not otherwise changing.
<!-- agentkit-rules:end tailwind -->

<!-- agentkit-rules:begin shadcn -->
# shadcn/ui

- Components under `components/ui` are source this project owns. Change them there when the variant is missing. Do not fork a one-off copy beside the page.
- Add components with the project's package runner and the `shadcn` CLI (`pnpm dlx shadcn@latest add button`, or npm/yarn/bun equivalent). Do not paste a component from an old `shadcn-ui` gist.
- Read `components.json` before composing. If the registry uses Base UI, custom triggers use the `render` prop. If it uses Radix, they use `asChild`. Do not mix the two in one component.
- Compose existing pieces before inventing markup: `Card` with its header, title, description, content, and footer; `Alert` for callouts; `Empty` for empty states; `Skeleton` for pending content; `Separator` instead of a bordered `div`.
- Use semantic colors from the theme: `bg-primary`, `bg-background`, `text-muted-foreground`. Do not use raw palette classes such as `bg-blue-500` on a themed component.
- Layout classes (`className` with flex, grid, gap, padding) are appropriate. Do not override a component's font, color, or radius from the call site when a variant exists.
- `Dialog`, `Sheet`, and `Drawer` always include a title. Hide it with an `sr-only` class when the design is visual-only.
- Forms use the project's `Field` primitives when they exist. Set `aria-invalid` on the control and the project's invalid data attribute on the field wrapper.
- An icon inside `Button` uses the component's icon slot (`data-icon` on current shadcn button styles). Do not add `w-4 h-4` to an icon the component already sizes.
- Toasts go through `sonner` when the project depends on it. Do not mount a second toast system.
- Run `shadcn info` (via the project package runner) when you are unsure which components are installed. Do not invent a component name.
<!-- agentkit-rules:end shadcn -->
