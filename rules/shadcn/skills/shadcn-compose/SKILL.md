---
name: shadcn-compose
description: Use when adding, composing, or restyling a shadcn/ui component in a project that has components.json.
---

# Compose shadcn/ui

1. Read `components.json` and list installed components before creating UI.
2. If the piece is missing, add it with the project's package runner and `shadcn@latest add`.
3. Check whether triggers use Base UI `render` or Radix `asChild`, and use that one.
4. Compose `Card`, `Field`, `Dialog`, `Alert`, `Empty`, or `Skeleton` instead of a styled `div` when those components exist.
5. Keep color and type in variants and semantic tokens. Use `className` for layout.
6. Give every dialog a title. Use the button's icon slot for icons.
7. Do not copy `components/ui` into a second folder.
