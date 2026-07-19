# Spec 02 — Contract Upload & Text Extraction (US-002, US-005 / FR-02, FR-03, FR-05)

Upload a PDF, extract its text once, store the contract row. Text becomes the single source of truth for extraction + chat.

## User flow
`/review` → select type (NDA/MSA) → drag/drop or pick a PDF (≤ 10 MB / ≤ 20 pp) → optionally add ≤ 5 custom terms in the pre-processing preview → this screen uploads the file immediately (`POST /api/contracts`) and shows the standard term list for the type while text extracts. (Processing is triggered separately — see spec 03.)

## Data model
Writes `contracts` (with `contract_text` incl. `[PAGE N]`, `file_path` nullable, `page_count`, `status='uploaded'`) and `custom_key_terms` (one row per user term, `is_manual=true`, max 5 enforced by DB trigger).

## API — `POST /api/contracts`  (`runtime='nodejs'`)
- **Auth:** required.
- **Request:** `multipart/form-data` — `file` (PDF), `contract_type` (`nda|msa`), `custom_terms?` (JSON string array, ≤ 5).
- **Steps:**
  1. Validate: mime `application/pdf`; size ≤ `MAX_UPLOAD_MB`; `contract_type` in enum; `custom_terms` length ≤ `MAX_CUSTOM_TERMS`.
  2. `extractPdfText(buffer)` → `{ text, pageCount }`. Reject `pageCount > MAX_PAGES` (`422 CONTRACT_TOO_LONG`) and `estimateTokens(text) > MAX_CONTRACT_TOKENS`. `ScannedPdfError` → `422 SCANNED_PDF`.
  3. Insert `contracts` row (server client) → get `contract_id`.
  4. **Non-blocking Storage upload** (admin client) to `contracts/{user_id}/{contract_id}/{file_name}`. On success set `file_path`; on failure log + leave `file_path=null` (do **not** fail the request).
  5. Insert `custom_key_terms` rows if provided.
- **Response `201`:** `{ contract_id, status:'uploaded', page_count, viewer_available: boolean }` (`viewer_available` = file_path not null).
- **Errors:** `400` invalid; `413` too large; `422` `SCANNED_PDF` / `CONTRACT_TOO_LONG`; `401`.

## Files
- `app/review/page.tsx` (Client) — orchestrates type select → dropzone → preview.
- `components/review/ContractTypeSelect.tsx`, `PdfDropzone.tsx` (client-side size/type pre-check), `PreProcessingPreview.tsx` (standard terms for the type + `CustomTermAdder`), `CustomTermAdder.tsx` (add/remove, cap 5, "Custom" badge).
- `app/api/contracts/route.ts` — `POST` (this spec) + `GET` (spec 06).
- `lib/pdf/extract.ts` (spec 08), `lib/validation/upload.ts`.
- Standard term libraries: `lib/openai/prompts/terms.ts` (NDA + MSA lists from engineering-doc §8.2).

## State management
Local component state for selected type, file, and custom terms. On upload, hold `contract_id` + `viewer_available` to pass to the process step (spec 03). TanStack Query mutation for the POST.

## Design
Two-step feel on one screen: type selector (segmented control, `brand` active), dropzone card (`surface.card`, dashed `surface.border`, hover → `brand`). Preview lists standard terms as muted chips; custom terms get a `brand`-tinted "Custom" badge. Errors in `danger` with the exact limit that failed.

## Edge cases
- Non-PDF / >10 MB → rejected client-side before upload, and server-side as defense.
- Scanned PDF (text < 100 words) → clear "Scanned PDFs are not supported yet."
- >20 pages or >15k tokens → clear rejection naming the limit.
- Storage down → upload still succeeds; results page later uses the text-viewer fallback (spec 04).
- 6th custom term → blocked in UI; DB trigger is the backstop.
- Duplicate file name → allowed (path is namespaced by `contract_id`).

## Acceptance criteria
- ≤ 10 MB PDF uploads; text extracted with `[PAGE N]`; contract row created with `status='uploaded'`.
- Custom terms (≤ 5) persist with `is_manual=true`.
- Storage failure does not fail upload; `file_path` is null and `viewer_available=false`.
- Out-of-limit files rejected with a clear, specific message.
