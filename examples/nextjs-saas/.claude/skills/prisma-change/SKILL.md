---
name: prisma-change
description: Use when changing a Prisma schema, writing a migration, or editing the Prisma Client setup.
---

# Change the Prisma schema

1. Read `schema.prisma`, the Prisma config file, and the installed major version before editing.
2. Change the schema. Do not put the connection URL back on the datasource if this project uses Prisma 7 or later.
3. Create a migration with `prisma migrate dev`. Do not edit a migration that is already applied.
4. If the migration drops a column, table, or data, stop and ask before applying it.
5. Run `prisma generate`. On Prisma 7, migrate does not do this for you.
6. Import the client from the generator `output` path and reuse the existing singleton. Pass the project's driver adapter.
7. Update the caller to select only the fields it needs, inside a `$transaction` when several writes must commit together.
