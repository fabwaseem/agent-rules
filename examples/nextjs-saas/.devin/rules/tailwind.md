---
trigger: glob
globs: "**/*.css,**/*.tsx,**/*.jsx,postcss.config.*"
description: "Tailwind CSS v4 tokens, variants, and class usage."
---

# Tailwind CSS

- This pack assumes Tailwind v4. The CSS entry uses `@import "tailwindcss";`. Do not add `@tailwind base` directives to a v4 file.
- Design tokens live in `@theme` in CSS. When the repo still has `tailwind.config.ts`, extend that file instead of creating a second source of color and spacing.
- Use the spacing, color, and radius tokens already on the screen. An arbitrary value (`p-[13px]`, `bg-[#123456]`) is a last resort and only when no token fits.
- Responsive styles are mobile-first. The unprefixed class is the small screen. `md:` and `lg:` override it.
- Prefer `flex` with `gap-*` over `space-x-*` and `space-y-*`.
- Use `size-*` when width and height are equal.
- Conditional classes go through the project's `cn()` helper (usually `clsx` plus `tailwind-merge`). Do not build a class string with a ternary that can emit conflicting utilities.
- When colors are semantic (`bg-background`, `text-muted-foreground`), do not add a manual `dark:` color that fights the token.
- Do not restyle a third-party component by reaching into its DOM with complex selectors. Pass a `className` at the slot the component exposes.
- Do not reorder every class in a file you are not otherwise changing.
