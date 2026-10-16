---
applyTo: "**/*.tsx,**/*.jsx"
---

# React

- Function components only. Do not add a class component.
- On React 19, `ref` is a normal prop. Do not wrap a new component in `forwardRef`.
- Name the component and the file the same. Export it as a named export unless the framework file requires a default export.
- Props that change together become one object. A component with more than a handful of boolean mode flags should be split or composed.
- Prefer composition. Pass `children` or a render slot instead of threading data through components that do not use it.
- Derive values during render. Do not copy props into state with `useEffect` or `useState` just to display them.
- `useEffect` synchronizes with an external system. It is not a data-fetching tool when a Server Component or a loader can fetch.
- Do not call `use` to start a new client-side fetch when the page can read the data on the server.
- Event handlers are `handleX` inside the component and `onX` in props.
- List keys are stable ids from the data. Do not use the array index when the list can reorder, filter, or insert.
- State lives at the lowest component that needs it. Do not lift state into a provider for one screen.
- A custom hook starts with `use`, names the behavior, and does not render JSX.
- Do not disable the React Compiler, `eslint-plugin-react-hooks`, or a rules-of-hooks warning to make a line work. Restructure the component.
