# Spec 04 — Results Page: Viewer + Key Terms Panel + Inline Edit (US-003, US-004, US-006, US-009, US-011-partial / FR-04, FR-06, FR-07, FR-11)

Two-panel results view: contract on the left, key terms on the right. Always shows content (PDF viewer or text fallback).

## User flow
`/contract/[id]` → left: PDF viewer (or text fallback); right: key-terms list. Click a term's page → viewer scrolls to that page + highlights. Click a term value → inline edit → save. Expand "Why?" → source sentence. Low-confidence terms show ⚠️. Chat tab (spec 05) and feedback (spec 07) live here too.

## Data model
Reads `contracts` + `key_terms`. Writes `key_terms` on edit (`value`, `original_value`, `is_edited`).

## APIs
### `GET /api/contracts/[id]`
- Returns `{ contract, key_terms, viewer_available, signed_url }`. `signed_url` = 1-hour signed URL (admin client) when `file_path` present, else `null`.
### `PATCH /api/key-terms/[id]`  (US-009)
- **Request:** `{ value: string }` (non-empty).
- **Behavior:** if `is_edited=false`, copy current `value` → `original_value`; set `value`, `is_edited=true`. Must persist ≤ 2 s.
- **Response `200`:** updated `KeyTerm`. Errors: `400` empty, `404`, `401`.

## Files
- `app/contract/[id]/page.tsx` — Server shell (fetch contract+terms via server client), renders client panels.
- `components/contract/ResultsLayout.tsx` — two-panel/responsive container; holds shared `targetPage` state.
- `components/contract/ContractViewer.tsx` — PDF.js (`pdfjs-dist`), lazy pages, zoom, scroll; reacts to `targetPage`; highlights referenced span.
- `components/contract/TextViewerFallback.tsx` — parses `[PAGE N]` from `contract_text`, renders labelled page sections; same `targetPage` behavior.
- `components/contract/KeyTermsPanel.tsx` + `KeyTermRow.tsx` — Term | Value | Page | Confidence.
- `components/contract/ConfidenceBadge.tsx` (green/amber/red + icon), `LowConfidenceWarning.tsx` (⚠️ + non-dismissible tooltip), `WhyExpander.tsx` (source sentence), `InlineEditField.tsx` (edit + "Edited" badge).
- `components/contract/LegalDisclaimer.tsx` — always rendered.
- `app/api/contracts/[id]/route.ts` (`GET`, `DELETE`), `app/api/key-terms/[id]/route.ts` (`PATCH`).

## State management
TanStack Query for contract+terms; `PATCH` mutation with optimistic update + rollback. `targetPage` lifted into `ResultsLayout` and passed to both viewers and the panel. Viewer choice: `viewer_available && signed_url` → PDF viewer, else fallback.

## Design
Left ~60% / right ~40% on desktop; stacked/tabbed on mobile. Term rows in `surface.card` with `surface.divider` separators. Confidence: green `success` (≥.80), amber `warning` (.50–.79), red `danger` (<.50) with tinted background + icon (color never the only signal). Page number is a `brand` link. "Edited" badge in `ink.secondary`. Disclaimer pinned at panel footer.

## Edge cases
- `viewer_available=false` (Storage failed) → text fallback; page-click still scrolls to the `[PAGE N]` section.
- Signed URL expired mid-session → re-fetch `GET` to refresh it.
- Term with null value / null page → show "—"; low confidence still flagged.
- Empty edit value → rejected; field stays in edit mode with `danger` hint.
- `status='processing'` when opened → show progress; `status='error'` → error + "Re-process".

## Acceptance criteria
- Both viewers honor `targetPage`; clicking a term's page scrolls to it and highlights.
- Confidence colour-coded; < 50% shows ⚠️ + verify tooltip and is never hidden.
- "Why?" reveals the verbatim `source_sentence`.
- Inline edit saves ≤ 2 s, shows "Edited", preserves `original_value`.
- "Not legal advice" disclaimer present on the page.
