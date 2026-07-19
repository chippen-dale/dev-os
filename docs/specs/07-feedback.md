# Spec 07 — Feedback (US-010 / FR-12)

Thumbs up/down + optional comment per contract review, feeding the improvement loop.

## User flow
Results page → feedback widget → thumbs up or down → optional comment → submit → confirmation ("Thanks for your feedback"). One active feedback per contract per user; re-submitting updates it.

## Data model
Writes `user_feedback` (`rating`, `comment?`, `contract_id`, `user_id`, `created_at`).

## API — `POST /api/contracts/[id]/feedback`
- **Auth:** required; 404 if contract not owned.
- **Request:** `{ rating: 'up'|'down', comment?: string }`.
- **Behavior:** insert a `user_feedback` row (MVP: allow multiple; UI shows the latest). 
- **Response `201`:** the `Feedback` row. Errors: `400` invalid rating, `404`, `401`.

## Files
- `app/api/contracts/[id]/feedback/route.ts`
- `components/contract/FeedbackWidget.tsx`
- `lib/validation/feedback.ts`

## State management
Local widget state (selected rating, comment). Submit = mutation → success confirmation; disable while pending.

## Design
Two icon buttons (👍/👎) in `ink.secondary`, selected → `brand`. Optional comment textarea reveals after a rating is chosen. Submit is `brand`; confirmation replaces the widget. Compact, non-intrusive — sits below the key-terms panel.

## Edge cases
- Comment without a rating → submit disabled.
- Network failure → keep input, show retry.
- Rapid re-submit → debounce; latest wins.

## Acceptance criteria
- Thumbs + optional comment submit and persist to `user_feedback` with the correct `contract_id`/`user_id`.
- Confirmation shown on success; errors handled without data loss.
- Only the owner can attach feedback to a contract (RLS).
