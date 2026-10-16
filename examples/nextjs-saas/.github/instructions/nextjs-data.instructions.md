---
applyTo: "app/**/*.ts,app/**/*.tsx,src/app/**/*.ts,src/app/**/*.tsx,**/actions.ts"
---

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
