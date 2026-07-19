# Spec 08 — Shared Infrastructure

Foundational modules every feature depends on. Build this first.

## Dependencies to add

```bash
npm install @supabase/supabase-js @supabase/ssr openai pdf-parse zod
npm install -D tailwindcss postcss autoprefixer @types/pdf-parse
npx tailwindcss init -p
```

---

## 1. Supabase clients (`lib/supabase/`)

- **`client.ts`** — browser client via `createBrowserClient` (`@supabase/ssr`) using `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Used by Client Components for auth + RLS-scoped reads.
- **`server.ts`** — request-scoped server client via `createServerClient` reading/writing cookies (`cookies()` from `next/headers`). Used in Route Handlers and Server Components; enforces RLS as the signed-in user.
- **`admin.ts`** — service-role client using `SUPABASE_SERVICE_ROLE_KEY`. **SERVER ONLY.** Used only for: creating signed URLs, Storage uploads/deletes. Never imported into a Client Component.

## 2. OpenAI client (`lib/openai/`)

- **`client.ts`** — singleton `new OpenAI({ apiKey: process.env.OPENAI_API_KEY })`. Model from `OPENAI_MODEL` (default `gpt-4o`).
- **`prompts/`** — `extraction.ts` (few-shot NDA+MSA system prompt, standard-term libraries per type, custom-term injection) and `chat.ts` (document-only system prompt, `[Page X]` citation rule, query-classification scaffold). See engineering-doc §8.2–8.3.
- **`extract.ts`** and **`chat.ts`** — orchestration (detailed in specs 03 and 05).
- **`withRetry(fn)`** helper — 3 attempts, exponential backoff (250ms → 1s → 2s); throws a typed `OpenAiError` after exhaustion.

## 3. PDF extraction (`lib/pdf/extract.ts`)

```ts
// Returns { text, pageCount }. text has a "[PAGE N]" marker before each page's content.
export async function extractPdfText(buffer: Buffer): Promise<{ text: string; pageCount: number }>;
```
- Uses `pdf-parse` with a per-page `pagerender` callback to insert `[PAGE 1]`, `[PAGE 2]`… markers.
- **Scanned guard:** if total word count < 100 → throw `ScannedPdfError` ("Scanned PDFs are not supported yet").
- **Token guard helper** `estimateTokens(text)` (~4 chars/token); caller rejects > `MAX_CONTRACT_TOKENS`.

## 4. Validation (`lib/validation/`)

Zod schemas, one per request body. Examples: `uploadContractSchema`, `processSchema`, `editKeyTermSchema`, `chatSchema`, `feedbackSchema`. Each exported with an inferred TS type.

## 5. Errors (`lib/errors.ts`)

```ts
export class AppError extends Error {
  constructor(public code: string, message: string,
              public status: number, public retryable = false,
              public fields?: Record<string, string>) { super(message); }
}
export function toResponse(err: unknown): Response; // → { error: {...} } with correct status
```
Named factories: `unauthorized()`, `notFound()`, `validation(fields)`, `payloadTooLarge()`, `scannedPdf()`, `contractTooLong()`, `openAiFailed()` (retryable), `rateLimited()`, `conflict()`.

## 6. Rate limiting (`lib/security/rate-limit.ts`)

- Per-user fixed-window limiter on `POST …/process` and `POST …/chat`.
- MVP: in-memory map keyed by `user_id` (note: resets on cold start — acceptable for MVP; swap for Upstash/Redis in Stage 7).
- Defaults: process = 10/min, chat = 30/min. Exceed → `429 rateLimited()`.

## 7. Design tokens (`tailwind.config.ts` + `app/globals.css`)

Map the allNeurons palette (`docs/design.md`) into Tailwind theme tokens. Minimum set:

```ts
// tailwind.config.ts (theme.extend.colors)
brand:   { DEFAULT: '#115ACB', 600: '#0044AE', 700: '#0D469E', 900: '#082A5E', 50: '#E7EFFC' },
ink:     { DEFAULT: '#070A0E', secondary: '#4A4C4F', 300: '#8F9193' },
surface: { page: '#FAFAFA', card: '#FFFFFF', border: '#DADADB', divider: '#F0F0F1' },
success: '#13A10E', warning: '#FFAA33', danger: '#D13438',
```
- Font family: `Inter Display, Inter, system-ui, sans-serif`. Type scale per design.md (H1 48/56·700, body 16/24·500, caption 12/18·400).
- Confidence colors: green→`success`, amber→`warning`, red→`danger` (with tint backgrounds `#E7F6E7 / #FFF9F0 / #FAEBEB`).
- Reusable primitives in `components/ui/`: `Button`, `Badge`, `Tooltip`, `Card`, `Spinner`, `EmptyState`.

## Acceptance criteria
- `admin.ts` is never imported client-side (enforced by a lint rule or `server-only` import).
- `extractPdfText` returns page markers; a <100-word PDF throws `ScannedPdfError`.
- Every color used in UI resolves to a token above.
