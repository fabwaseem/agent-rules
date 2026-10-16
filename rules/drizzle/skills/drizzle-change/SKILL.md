---
name: drizzle-change
description: Use when changing a Drizzle schema, SQL migration, or database client setup.
---

# Change the Drizzle schema

1. Read the existing schema module and `drizzle.config.ts`. Match that style.
2. Edit the table definition, including indexes for new filters and joins.
3. Run `drizzle-kit generate` and review the SQL. Do not edit a migration that is already applied.
4. If the SQL drops a column or deletes rows, stop and ask before applying it.
5. Apply locally with `drizzle-kit migrate`. Do not `push` to a shared database.
6. Use the shared client. Parameters stay bound. Do not concatenate request input into SQL.
