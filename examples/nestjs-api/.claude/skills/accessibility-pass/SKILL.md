---
name: accessibility-pass
description: Use when building or reviewing UI, dialogs, forms, menus, or keyboard interaction.
---

# Accessibility pass

1. Check the heading outline. One `h1`, then levels that do not skip.
2. Confirm every input has a visible label and every icon-only button has an accessible name.
3. Tab through the new UI. Focus must be visible, and a dialog must trap it and close on Escape.
4. Confirm status messages after submit are announced or moved to.
5. Confirm images have correct `alt` text and color is not the only state indicator.
6. Confirm motion respects `prefers-reduced-motion`.
7. Fix issues in the component that owns the markup. Do not patch around them with click handlers on `div` elements.
