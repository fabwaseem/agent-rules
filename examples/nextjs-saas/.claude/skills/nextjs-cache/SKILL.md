---
name: nextjs-cache
description: Use when adding caching, use cache, cache tags, or fixing stale data in a Next.js App Router project.
---

# Cache a read

1. Read `next.config` and `package.json`. Follow the installed Next.js version.
2. If `cacheComponents` is off, do not add `"use cache"`. Say what would need to be enabled before using it.
3. If it is on, put `"use cache"` on the async function, then call `cacheLife` with an explicit profile.
4. Call `cacheTag` for each entity id and each list the function returns.
5. Keep `cookies()` and `headers()` outside the cached function. Pass only the values that belong in the cache key.
6. Do not cache per-user private data under a shared tag.
7. Point the matching mutation at `updateTag` or `revalidateTag` for those tags.
