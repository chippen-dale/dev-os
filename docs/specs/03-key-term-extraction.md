# Spec 03 — Key Term Extraction (US-002, US-003, US-004, US-005 / FR-04, FR-11)

Run GPT-4o over the stored contract text + custom terms; persist structured key terms with page + confidence + source sentence.

## User flow
On `/review`, after upload, user clicks **Process Contract** → 3-step progress (extract text ✓ → analyse with AI → compile results) → redirect to `/contract/[id]`.

## Data model
Reads `contracts.contract_text` + `custom_key_terms`. Writes `key_terms` (one row per term). Updates `contracts.status`: `processing` → `complete` | `error`.

## API — `POST /api/contracts/[id]/process`  (`runtime='nodejs'`, `maxDuration=60`)
- **Auth:** required; 404 if contract not owned/found. Rate-limited (spec 08).
- **Steps:**
  1. Load contract; if `status='processing'` → `409 conflict`. Set `status='processing'`.
  2. Load custom term names for the contract.
  3. Build extraction prompt: few-shot system prompt + standard term library for `contract_type` + appended custom terms + the contract text. JSON mode, `temperature=0.1`, `max_tokens=2000`.
  4. `withRetry` the call; parse JSON array. **On parse failure**, one corrective retry ("Return only the JSON array, no explanation."). Still bad → throw.
  5. Validate each item against the term schema; clamp `confidence_score` to [0,1]; mark `is_custom` for terms whose name matches a custom term.
  6. Insert `key_terms` rows; set `status='complete'`.
  7. On any OpenAI/parse failure after retries: set `status='error'`, return `502 openAiFailed()` (`retryable:true`) — contract can be re-processed without re-upload.
- **Response `200`:** `{ status:'complete', terms: KeyTerm[] }`.

## Extraction contract (model output)
```json
[{ "term_name":"string","value":"string","page_number":1,
   "confidence_score":0.0,"source_sentence":"string" }]
```
- Standard terms per type (engineering-doc §8.2). Custom terms appended zero-shot.
- Confidence self-reported in the same pass (no second call).
- Missing term → model returns the term with empty value + low confidence (never omit silently); UI shows ⚠️.

## Files
- `app/api/contracts/[id]/process/route.ts`
- `lib/openai/extract.ts` — `extractKeyTerms({ contractText, contractType, customTerms })`
- `lib/openai/prompts/extraction.ts`, `lib/openai/prompts/terms.ts`
- `components/review/ProcessingProgress.tsx`
- `lib/validation/keyTerm.ts`

## State management
Client fires the process mutation, shows `ProcessingProgress`, then routes to results with the returned terms seeding the cache.

## Design
Full-width progress card, three steps with check/spinner states in `brand`. Error state: `danger` banner + "Try again" button re-calling process.

## Edge cases
- Malformed JSON from model → single corrective retry, then `error` status + retryable message.
- OpenAI timeout/5xx → 3 retries w/ backoff; then `502` retryable.
- Non-NDA/MSA content → still extracts; most terms low confidence (⚠️), never blocked.
- Cost/latency: ~15k in + ~1.5k out ≈ $0.10; ≤ 30 s P95 target.
- Re-process allowed only from `error` or `complete` (not while `processing`).

## Acceptance criteria
- Standard terms extracted for the type; each has value, `page_number` (1-indexed), `confidence_score`, `source_sentence`.
- Custom terms appear with `is_custom=true`, same structure.
- Confidence < 0.50 flagged in UI (spec 04), never hidden.
- Failure leaves `status='error'`; retry works without re-upload.
