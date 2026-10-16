---
name: security-review
description: Use when adding or changing authentication, authorization, cookies, webhooks, uploads, or any handler that accepts untrusted input.
---

# Security review

1. Find the boundary that accepts input. Name the schema that validates it.
2. Identify where the actor is authenticated and where the resource is authorized. Confirm the user id is not taken from the client.
3. Check queries, shell calls, and HTML for string concatenation of untrusted data.
4. Check logs and responses for secrets, tokens, cookies, and stack traces.
5. For a cookie session, confirm `HttpOnly`, `Secure`, `SameSite`, and an origin check on mutations.
6. For a file upload or webhook, confirm size limits, an allow-list, and a signature or rate limit.
7. Report each issue as the file, the missing control, and the concrete change. Do not rewrite unrelated code.
