---
trigger: always_on
description: "Commit, branch, and pull request conventions."
---

# Git

- Use Conventional Commits: `type(scope): subject`.
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`.
- Subject is imperative, has no trailing period, and stays within 72 characters. The body says why, not a file list.
- One logical change per commit. Do not mix a refactor with a behavior change.
- Branch names look like `fix/session-expiry` or `feat/billing-webhook`.
- Do not commit secrets, `.env` files, `node_modules`, build output, or coverage.
- Do not `git push --force` to a shared branch. Do not `git commit --amend` after the commit is on a remote.
- Do not add `Co-authored-by` or other attribution trailers unless the user explicitly asks.
- Do not skip hooks (`--no-verify`) unless the user explicitly asks.
- Before committing, run the project's typecheck and the tests that cover the change.
- A pull request states what changed, why, and how to verify it. Link the issue when there is one.
- Leave unrelated dirty files untouched. Do not revert user changes you did not make.
