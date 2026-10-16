---
name: add-rule
description: Use when adding or changing an agentkit-rules stack rule, skill, installer behavior, or example.
---

# Add or change a rule

1. Edit the `.mdc` body or add a new file under `rules/<stack>/`.
2. Use Cursor frontmatter: `description`, optional `globs` as one comma-separated string, and `alwaysApply`.
3. Register the file in `rules/index.json` in the existing stack order.
4. If the task is a procedure, add `rules/<stack>/skills/<name>/SKILL.md` with `name` and `description` only.
5. Run `npm run examples`, then `npm run validate` and `npm test`.
6. Do not edit generated example output by hand.
