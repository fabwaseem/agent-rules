---
trigger: glob
globs: "components/ui/**/*.ts,components/ui/**/*.tsx,components.json,**/*.tsx"
description: "shadcn/ui composition, styling, and CLI usage."
---

# shadcn/ui

- Components under `components/ui` are source this project owns. Change them there when the variant is missing. Do not fork a one-off copy beside the page.
- Add components with the project's package runner and the `shadcn` CLI (`pnpm dlx shadcn@latest add button`, or npm/yarn/bun equivalent). Do not paste a component from an old `shadcn-ui` gist.
- Read `components.json` before composing. If the registry uses Base UI, custom triggers use the `render` prop. If it uses Radix, they use `asChild`. Do not mix the two in one component.
- Compose existing pieces before inventing markup: `Card` with its header, title, description, content, and footer; `Alert` for callouts; `Empty` for empty states; `Skeleton` for pending content; `Separator` instead of a bordered `div`.
- Use semantic colors from the theme: `bg-primary`, `bg-background`, `text-muted-foreground`. Do not use raw palette classes such as `bg-blue-500` on a themed component.
- Layout classes (`className` with flex, grid, gap, padding) are appropriate. Do not override a component's font, color, or radius from the call site when a variant exists.
- `Dialog`, `Sheet`, and `Drawer` always include a title. Hide it with an `sr-only` class when the design is visual-only.
- Forms use the project's `Field` primitives when they exist. Set `aria-invalid` on the control and the project's invalid data attribute on the field wrapper.
- An icon inside `Button` uses the component's icon slot (`data-icon` on current shadcn button styles). Do not add `w-4 h-4` to an icon the component already sizes.
- Toasts go through `sonner` when the project depends on it. Do not mount a second toast system.
- Run `shadcn info` (via the project package runner) when you are unsure which components are installed. Do not invent a component name.
