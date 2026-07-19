# Spec 01 — Authentication (US-001 / FR-01, FR-13)

Email/password auth via Supabase; private per-user data enforced by RLS.

## User flow
`/` → "Get Started Free" → `/login?mode=signup` → submit email+password → Supabase creates user + session → redirect `/dashboard` (empty state). Returning: `/login` → sign in → `/dashboard`. Sign out from the dashboard header → back to `/`.

## Data model
No app tables — uses Supabase-managed `auth.users`. Every app table's `user_id` FKs to it; RLS keys on `auth.uid()`.

## Files
- `app/login/page.tsx` — Client Component; `AuthForm` with `mode` from `?mode=` (`signin` default).
- `components/auth/AuthForm.tsx` — email/password fields; calls `supabase.auth.signUp()` or `signInWithPassword()` (browser client); shows inline errors; on success `router.push('/dashboard')`.
- `components/auth/SignOutButton.tsx` — `supabase.auth.signOut()` → `router.push('/')`.
- `middleware.ts` — refresh session (via `@supabase/ssr`) and **gate protected routes** (`/dashboard`, `/review`, `/contract/:path*`): no session → redirect `/login`. Signed-in user hitting `/login` → redirect `/dashboard`.
- `lib/auth/getUser.ts` — helper for Server Components / handlers: returns the user or throws `unauthorized()`.

## State management
Auth state from the Supabase browser client (cookie-persisted). No global store; components read session on mount and subscribe to `onAuthStateChange`.

## Design
Centered card on `surface.page`; `brand` primary button; email/password inputs with `surface.border`; error text in `danger`. Link to toggle sign in / sign up. WCAG: labeled inputs, focus rings in `brand`.

## Edge cases
- Invalid credentials → "Email or password is incorrect." (no user enumeration).
- Duplicate signup email → Supabase error surfaced plainly.
- Weak password (< 6 chars, Supabase default) → inline message.
- Email confirmation: if enabled in Supabase, show "Check your email to confirm" state; otherwise redirect straight to dashboard.
- Session expiry mid-session → middleware redirects to `/login` on next protected navigation.

## Acceptance criteria
- Sign up / sign in complete ≤ 10 s and redirect to `/dashboard`.
- New user in Supabase → **Authentication → Users**.
- Invalid creds show a clear error, no crash.
- Signed-out access to `/dashboard`, `/review`, `/contract/[id]` → redirect to `/login`.
- Sign out returns to `/` and clears the session.
