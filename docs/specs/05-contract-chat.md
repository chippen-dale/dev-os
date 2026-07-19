# Spec 05 — Contract Chat (US-007, US-012 / FR-08, FR-09)

Plain-English Q&A grounded strictly in the contract text, with persistent history and mandatory page citations.

## User flow
Results page → Chat tab → type question → grounded answer appears with a "Source: Page X" citation linking into the viewer. Reopening the contract reloads the saved conversation.

## Data model
Reads `contracts.contract_text` + full `chat_messages` for the session. Writes `chat_sessions` (created on first message, one per contract) and `chat_messages` (user + assistant rows).

## APIs
### `POST /api/contracts/[id]/chat`  (`runtime='nodejs'`, `maxDuration=60`)
- **Auth:** required; 404 if not owned. Rate-limited (30/min).
- **Request:** `{ message: string }` (non-empty).
- **Steps:**
  1. Ensure a `chat_sessions` row (create if absent).
  2. Load full history ascending (up to 200) + `contract_text`.
  3. Classify query (`contract` / `history` / `both`) in-prompt (no extra call) to shape context.
  4. Call GPT-4o: document-only system prompt, `temperature=0.4`, `max_tokens=1000`. Enforce "Based on the document…" framing + `[Page X]` citation; "I cannot find this in the document." when absent.
  5. Insert user message, then assistant message.
- **Response `200`:** `{ message: ChatMessage, citation_page: number|null }` (`citation_page` parsed from `[Page X]`).
- **Errors:** `404`; `429` rate-limited; `502` `openAiFailed` (retryable); `401`.
### `GET /api/contracts/[id]/messages`
- Returns `{ session_id, messages: ChatMessage[] }` ascending.

## Files
- `app/api/contracts/[id]/chat/route.ts`, `app/api/contracts/[id]/messages/route.ts`
- `lib/openai/chat.ts` — `answerQuestion({ contractText, history, question })`
- `lib/openai/prompts/chat.ts`
- `components/chat/ChatPanel.tsx`, `MessageList.tsx`, `MessageBubble.tsx`, `MessageInput.tsx`, `PageCitationLink.tsx`

## State management
TanStack Query loads history; send is a mutation with optimistic user-message append; on success append the assistant message and (if `citation_page`) enable the citation link, which sets the shared `targetPage` (spec 04) to scroll the viewer.

## Design
User messages right-aligned (`brand` tint), assistant left-aligned (`surface.card`). Citation as a `brand` inline link ("Source: Page X"). Input pinned bottom with send button; disabled + spinner while awaiting. Empty state: "Ask your first question about this contract."

## Edge cases
- Answer absent → "I cannot find this in the document." (correct, not an error); `citation_page=null`.
- OpenAI failure → assistant message not persisted; show retry, keep the user's typed message.
- Very long history (approaching 200 / token budget) → still full-context per MVP; monitor tokens (chunked RAG deferred).
- Empty/whitespace message → blocked client + server.
- Reopen contract → prior session + messages load in order.

## Acceptance criteria
- Response ≤ 15 s P95, grounded in the document, cites a page (or says it can't find it).
- Both user + assistant messages persisted with role + timestamp; reload restores them.
- Citation link scrolls the viewer to the cited page.
- A question about a topic absent from the doc returns the "cannot find" response (hallucination regression test).
