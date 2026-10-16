---
applyTo: "**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx,**/__tests__/**/*.ts,**/__tests__/**/*.tsx,vitest.config.*,playwright.config.*"
---

# Testing

- Use Vitest for unit and component tests. Use Testing Library for React. Use Playwright only when the repo already has it. Do not add a second test runner.
- Test behavior a caller can observe. Do not assert private function names, call counts, or implementation order.
- The test name states the behavior and the condition: "rejects a second session for the same user".
- Query UI by role, label, or text. Do not query by class name or DOM structure.
- Cover the failure path for the change: invalid input, unauthenticated, forbidden, and not found, when those states exist.
- Mock at the network or module boundary. Do not mock the function under test.
- Unit tests do not call the network, a real database, or the real clock. Integration tests that do are named as such and clean up after themselves.
- Do not add a snapshot as the only assertion for logic or markup. A snapshot is acceptable for stable serialized output such as a migration plan.
- Build data with a small factory. Do not copy a 50-line fixture between files.
- Place the test next to the code (`feature.test.ts`) or in the folder the repo already uses. Do not invent a third layout.
- While iterating, run the single test file. Before handing work back, run the suite the CI job runs for that area.
- Do not weaken an assertion or skip a test to make it pass. Fix the code or explain the product change in the test name.
