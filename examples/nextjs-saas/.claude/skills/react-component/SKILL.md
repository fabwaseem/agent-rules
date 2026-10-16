---
name: react-component
description: Use when creating a React component, splitting a large component, or moving state.
---

# Add a React component

1. Look for an existing component that already does this before adding a new file.
2. Create a function component with a named export. Take `ref` as a prop on React 19.
3. Keep `"use client"` off unless the component needs state, effects, or browser APIs.
4. Put state in the lowest component that changes. Derive everything else during render.
5. Pass `children` or a slot instead of adding another boolean mode.
6. Use a stable id as the list key.
7. Add a Testing Library test that queries by role or label when the component has behavior.
