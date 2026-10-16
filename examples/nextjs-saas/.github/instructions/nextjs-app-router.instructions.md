---
applyTo: "app/**/*.ts,app/**/*.tsx,src/app/**/*.ts,src/app/**/*.tsx,next.config.*,proxy.ts,middleware.ts"
---

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
