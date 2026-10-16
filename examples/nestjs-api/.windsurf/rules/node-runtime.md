---
trigger: model_decision
description: "Node.js configuration, process lifecycle, logging, and service errors. Use when adding a server, script, worker, or environment variable."
---

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
