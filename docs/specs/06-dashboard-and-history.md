# Spec 06 — Dashboard & History (US-008 / FR-10) + Contract Deletion (GDPR)

Landing surface for a signed-in user: totals, type breakdown, sortable history, and delete.

## User flow
Sign in → `/dashboard`. Empty: "No contracts reviewed yet — upload your first contract to begin" + "Review a Contract" CTA. Populated: summary cards (total, NDA count, MSA count, last-5) + sortable table (name, type, date, status). Row click → `/contract/[id]`. Delete action → confirm → row + all associated data removed.

## Data model
Reads `contracts` (RLS-scoped). Delete cascades `key_terms`, `custom_key_terms`, `chat_sessions`→`chat_messages`, `user_feedback` (FK `on delete cascade`) and removes the Storage object.

## APIs
### `GET /api/contracts`  (also usable directly via Supabase client)
- **Query:** `?sort=created_at|file_name|contract_type&order=asc|desc` (default `created_at desc`).
- **Response `200`:** `{ totals:{ all, nda, msa }, contracts: [{ id, file_name, contract_type, status, created_at }] }`.
### `DELETE /api/contracts/[id]`
- Deletes the Storage object (admin client) if `file_path` set, then deletes the contract row (cascade handles children).
- **Response `204`.** Errors: `404`, `401`.

## Files
- `app/dashboard/page.tsx` — Server Component; fetch summary + list via server client; render client table.
- `components/dashboard/SummaryCards.tsx`, `ContractTable.tsx` (sortable headers), `EmptyState.tsx`, `DeleteContractButton.tsx` (confirm dialog).
- `app/api/contracts/route.ts` (`GET`), `app/api/contracts/[id]/route.ts` (`DELETE`).

## State management
Initial data server-rendered; client table manages sort state and re-queries (or sorts client-side for small lists). Delete = mutation → optimistic row removal + toast; rollback on error.

## Design
Summary cards in `surface.card` with `brand` accent numerals. Status pill colours: `uploaded`/`processing` → `ink.secondary`/`warning`, `complete` → `success`, `error` → `danger`. Sortable header carets in `brand`. Delete in a subtle `danger` text button; confirm dialog required.

## Edge cases
- No contracts → empty state, not an empty table.
- `processing`/`error` rows still listed with the right pill; clicking opens the results page in that state.
- Delete a contract currently open in another tab → 404 there on next action.
- Storage object already gone → ignore the Storage error, still delete the row.

## Acceptance criteria
- Dashboard shows total processed, NDA/MSA breakdown, last-5, and a sortable full list.
- Sort by date/name/type works; row click opens results.
- Delete removes the contract and all associated rows + the PDF; the row disappears.
- Only the owner's contracts are ever visible (RLS).
