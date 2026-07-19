# ContractIQ — Implementation Specs: Overview & Conventions

**Derived from:** `docs/engineering/engineering-doc.md` (v1.0). Read that first — it is the authoritative architecture. These specs turn it into file-by-file build instructions.

**App root:** `contractiq/` (Next.js 14 App Router + TypeScript). All paths below are relative to `contractiq/` unless prefixed with `docs/`.

---

## Spec index & build order

Build in this order — later specs depend on earlier ones.

| # | Spec | Delivers | Depends on |
|---|---|---|---|
| — | `supabase-schema.sql` | All tables, RLS, triggers, Storage bucket + policies — the entire DB as one paste-and-run file (FR-14) | run first, in Supabase |
| — | `.env.example` → `.env.local` | Credentials + limits | run first |
| 08 | `08-shared-infrastructure.md` | Supabase/OpenAI/pdf clients, validation, errors, rate limiting, design tokens | schema, env |
| 01 | `01-auth.md` | Sign up/in/out, middleware, protected routes | 08 |
| 02 | `02-contract-upload-and-extraction.md` | Upload → text extraction → contract row | 08 |
| 03 | `03-key-term-extraction.md` | Process → GPT-4o → key_terms | 02, 08 |
| 04 | `04-results-and-key-terms-panel.md` | Results page: viewer + panel + inline edit | 03, 08 |
| 05 | `05-contract-chat.md` | Grounded Q&A + persistent history | 04, 08 |
| 06 | `06-dashboard-and-history.md` | Dashboard list, summary, delete | 01, 02 |
| 07 | `07-feedback.md` | Thumbs + comment | 04 |

---

## Shared TypeScript types (`lib/types.ts`)

```ts
export type ContractType = 'nda' | 'msa';
export type ContractStatus = 'uploaded' | 'processing' | 'complete' | 'error';
export type MessageRole = 'user' | 'assistant';
export type FeedbackRating = 'up' | 'down';

export interface Contract {
  id: string;
  user_id: string;
  file_name: string;
  contract_type: ContractType;
  contract_text: string;      // includes [PAGE N] markers
  file_path: string | null;   // null if Storage upload failed
  page_count: number;
  status: ContractStatus;
  created_at: string;
  updated_at: string;
}

export interface KeyTerm {
  id: string;
  contract_id: string;
  user_id: string;
  term_name: string;
  value: string | null;
  page_number: number | null;
  confidence_score: number | null; // 0.000–1.000
  source_sentence: string | null;
  is_custom: boolean;
  original_value: string | null;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  role: MessageRole;
  content: string;
  created_at: string;
}

export interface Feedback {
  id: string;
  contract_id: string;
  user_id: string;
  rating: FeedbackRating;
  comment: string | null;
  created_at: string;
}
```

---

## Shared conventions

- **Runtime:** any route handler that uses `pdf-parse` or OpenAI must export `export const runtime = 'nodejs'`. Processing/chat handlers also `export const maxDuration = 60`.
- **Auth in handlers:** resolve the user from the Supabase server client; return `401` if none. RLS is the primary guard; also pass `user_id` explicitly on writes (defense in depth).
- **Validation:** every request body/params validated with a `zod` schema in `lib/validation/`. Invalid → `400` with `fields`.
- **Errors:** all handlers return the envelope `{ "error": { "code", "message", "retryable"?, "fields"? } }` via helpers in `lib/errors.ts`. No silent failures.
- **Confidence tiers (UI):** green ≥ 0.80, amber 0.50–0.79, red < 0.50. Red never hides the term — it adds ⚠️ + tooltip.
- **Page markers:** extracted text stores page breaks as `[PAGE N]` (1-indexed). Both the text-viewer fallback and citation logic parse these.
- **Design system:** all colors/spacing/type come from `docs/design.md` via the tokens in `08-shared-infrastructure.md`. Never hardcode off-token hex values.
- **Every results page** shows the "This is an AI-assisted review tool, not legal advice…" disclaimer.

## Acceptance criteria (global)

- `supabase-schema.sql` runs clean on a fresh project; 6 tables show RLS = ON; `contracts` bucket exists and is private.
- A signed-out user is redirected from any protected route to `/login`.
- A user can never read or mutate another user's rows (verified by an RLS cross-user test — see `13` Testing in the engineering doc).
- All latency/limit constraints from engineering-doc §5 are enforced server-side.
