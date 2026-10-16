---
trigger: always_on
description: "Security boundaries for input, auth, secrets, cookies, and headers."
---

# Security

- Validate untrusted input at the boundary that receives it: server action, route handler, webhook, or queue consumer. Use the project's schema library, normally Zod. Do not trust client-side checks.
- Authorize on the server from the session or token. Never accept a user id, role, or tenant id from the client as proof of identity.
- Queries use placeholders or the query builder. Do not concatenate untrusted strings into SQL, shell commands, or HTML.
- Secrets come from the environment. Never commit them, log them, or return them. `.env.example` contains names and dummy values only.
- Auth cookies are `HttpOnly`, `Secure`, and `SameSite=Lax` or `Strict`. Do not store access tokens in `localStorage`.
- Cookie-authenticated mutations check the request origin. Do not disable CSRF protection to make a form work.
- Compare secrets and tokens with a timing-safe equality check.
- Production responses include `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a frame policy of `DENY` or `frame-ancestors 'none'`. A content security policy must not allow `unsafe-eval` in production.
- Errors returned to clients are stable codes and messages. Do not send stack traces, SQL, or internal paths.
- Rate-limit authentication, password reset, and public webhooks.
- File uploads check content type and size, use an allow-list of extensions, and are not served from the source directory.
- New dependencies are added to the lockfile with the project's package manager. Do not suggest `--ignore-scripts` as a fix.
