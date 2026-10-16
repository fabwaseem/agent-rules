---
name: git-commit
description: Use when creating a git commit or pull request and the change should follow this repository's commit conventions.
---

# Commit a change

1. Inspect `git status` and `git diff`. Stage only the files that belong to this change.
2. Run typecheck and the tests that cover the change. Do not commit a known failure.
3. Write a Conventional Commit subject: `type(scope): imperative summary`.
4. Add a body when the reason is not obvious from the subject. Do not list files.
5. Do not add `Co-authored-by` or other trailers unless the user asked.
6. Do not amend or force-push a commit that is already on a remote.
7. If you open a pull request, include what changed, why, and how to verify it.
