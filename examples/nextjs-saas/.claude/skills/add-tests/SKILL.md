---
name: add-tests
description: Use when adding a feature or bugfix that needs Vitest or Testing Library coverage, or when the user asks for tests.
---

# Add tests

1. Find the runner the repo already uses. Do not add a second one.
2. Place the test next to the code, or in the existing test folder.
3. Name the test after the behavior and the condition.
4. Arrange only the data that matters. Use a factory if one exists.
5. Act through the public function, the HTTP handler, or the rendered UI.
6. Assert the observable result, including one failure path (invalid, unauthorized, or not found).
7. Query UI by role or label.
8. Run the single file, then the suite CI runs for that area.
