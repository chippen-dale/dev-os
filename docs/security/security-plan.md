# ContractIQ — Security Plan

**Version:** 1.0 · **Date:** 2026-07-18
**Scope:** Lab 3 — Security Foundation. Audit of the 8 common AI-app vulnerabilities and the controls in place.

## Summary
The application was built security-conscious, so 7 of the 8 target items were already satisfied. The one gap — missing HTTP security headers — has been fixed. See the table below.

## Audit & remediation

| # | Vulnerability | Status | Evidence / control |
|---|---|---|---|
| 1 | Hardcoded secrets | ✅ Already safe | All secrets read from `process.env`; none literal in source |
| 2 | Secrets in console logs | ✅ Already safe | No `console.*` logs of keys/tokens/secrets |
| 3 | Client-exposed secrets | ✅ Already safe | Only `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` are public (browser-safe). `SUPABASE_SERVICE_ROLE_KEY` and `OPENAI_API_KEY` are server-only |
| 4 | Unprotected API routes | ✅ Already safe | All 7 route handlers call `requireUser()`; RLS enforces per-user data isolation |
| 5 | Stack traces in responses | ✅ Already safe | `lib/errors.ts::toErrorResponse` returns a typed envelope; unknown errors → generic `500 INTERNAL`, never internals |
| 6 | **Missing security headers** | ✅ **Fixed** | Added `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-DNS-Prefetch-Control`, `Strict-Transport-Security` in `next.config.mjs` |
| 7 | Unsafe code patterns | ✅ Already safe | No `eval()` or `dangerouslySetInnerHTML` anywhere |
| 8 | Missing `.gitignore` entries | ✅ Already safe | `.gitignore` ignores `.env` and `.env*.local`; verified `.env.local` untracked |

## Defense-in-depth already in the app
- **Auth:** Supabase email/password + `middleware.ts` route protection (`/dashboard`, `/review`, `/contract`).
- **Authorization:** RLS on all 6 tables (`user_id = auth.uid()`) + owner checks in mutation handlers.
- **Input validation:** Zod schemas on every request body (`lib/validation/*`).
- **Rate limiting:** per-user limiter on `process` (10/min) and `chat` (30/min) — `lib/security/rate-limit.ts`.
- **Server-only service role:** `SUPABASE_SERVICE_ROLE_KEY` used only in `lib/supabase/admin.ts` (`server-only`).
- **Storage:** private `contracts` bucket, 1-hour signed URLs, owner-scoped Storage RLS.
- **Upload limits:** PDF-only, ≤ 10 MB, ≤ 20 pages, ≤ 15k tokens; scanned PDFs rejected.

## Files changed
- `contractiq/next.config.mjs` — security headers added.

## Outstanding / recommended follow-ups (beyond Lab 3 scope)
- **Content-Security-Policy** — omitted for now (a strict CSP needs a nonce for Next's inline scripts to avoid breaking the app). Add with nonce support before a hardened production launch.
- **Prompt-injection guard** — the project's `security-foundation` skill defines a `sanitizeForLLM()` guard (block "ignore previous instructions", "reveal system prompt", etc.) and instructs the model to ignore instructions embedded in contract text. Recommended for an LLM app; not part of Lab 3's 8-item pass.
- **Durable rate limiting** — current limiter is in-memory (resets on serverless cold start). Move to a Supabase `rate_limit_events` table or Upstash for production.
- **Next.js upgrade** — remaining `npm audit` items only clear by moving to Next 16 (breaking); evaluate separately.
