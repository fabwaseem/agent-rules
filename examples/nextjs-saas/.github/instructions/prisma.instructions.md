---
applyTo: "**/schema.prisma,prisma.config.ts,prisma7.config.ts,prisma/**/*.ts,prisma/**/*.prisma"
---

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
