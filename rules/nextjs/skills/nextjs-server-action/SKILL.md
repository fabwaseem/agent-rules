---
name: nextjs-server-action
description: Use when writing or changing a Next.js server action, form mutation, or the revalidation that follows it.
---

# Add a server action

1. Create or extend a file that starts with `"use server"` and exports only async functions.
2. Define a Zod schema and `safeParse` the argument. Return field errors instead of throwing.
3. Load the session inside the action and authorize the resource. Ignore any user id in the payload.
4. Perform the write. Use a transaction if more than one row must change together.
5. Invalidate cache. Use `updateTag` when the next render must wait for fresh data. On Next.js 16, use `revalidateTag(tag, "max")` for stale-while-revalidate. Check the installed Next.js version first.
6. Return `{ ok: true } | { ok: false, error, fieldErrors }`.
7. Wire the form to that result. Do not redirect away from a validation error.
