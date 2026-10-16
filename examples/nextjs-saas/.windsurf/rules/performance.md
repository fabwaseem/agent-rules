---
trigger: model_decision
description: "Performance constraints for data fetching, rendering, bundles, and database access. Use when adding requests, lists, images, or client-side libraries."
---

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
