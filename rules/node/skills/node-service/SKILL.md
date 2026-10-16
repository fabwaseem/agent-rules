---
name: node-service
description: Use when adding a Node.js server entrypoint, background worker, script, or a new environment variable.
---

# Add a Node.js service boundary

1. Read `engines` and the existing startup file. Extend that file instead of adding a second bootstrap.
2. Add the environment variable to the startup schema and to `.env.example` with a dummy value.
3. Fail startup if the variable is missing. Do not read `process.env` inside the business logic.
4. Set a timeout on outbound calls and a limit on inbound body size.
5. On `SIGTERM`, stop accepting work, drain in-flight tasks, and close the database pool.
6. Log a stable event name. Do not log the env object, cookies, or authorization headers.
