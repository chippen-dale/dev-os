# ContractIQ — Core Functionality Test Plan

**Version:** 1.0 · **Date:** 2026-07-18
**Scope:** Manual smoke test of the ContractIQ MVP, covering Lesson 1 (build the app) and Lesson 2 (memory layer).
**App URL:** http://localhost:3000

## Prerequisites
- Dev server running (`cd contractiq && npm run dev`).
- Supabase schema loaded: 6 tables + `contracts` Storage bucket (RLS on).
- `contractiq/.env.local` has valid Supabase + OpenAI keys.
- **Test data:** `contractiq/samples/sample-nda.pdf`, `contractiq/samples/sample-msa.pdf`.
- **Note:** if Supabase email confirmation is ON, confirm the sign-up email (or disable it under Authentication → Providers → Email) to complete login.
- Keep the **browser console (F12)** open — no red errors should appear during any test.

**Legend:** Result = ☐ Pass / ☐ Fail (add notes on failure).

---

## A. Authentication & Access

| ID | Steps | Expected result | Result |
|----|-------|-----------------|--------|
| A1 | Load `/` | Landing page renders, no console errors | ☐ |
| A2 | Sign up with a new email + password | Redirects to `/dashboard` (or "check email" if confirmation on); **user appears in Supabase → Authentication → Users** | ☐ |
| A3 | Sign out, then sign in with the same credentials | Lands on `/dashboard` | ☐ |
| A4 | Sign in with a wrong password | Clear "Email or password is incorrect" error; no crash | ☐ |
| A5 | While signed out, open `/dashboard` directly | Redirected to `/login` | ☐ |

## B. Contract Upload & Extraction

| ID | Steps | Expected result | Result |
|----|-------|-----------------|--------|
| B1 | Dashboard → Review a Contract → select **NDA** → upload `sample-nda.pdf` → Process | Progress steps show, then results page opens | ☐ |
| B2 | On the NDA results, review the key terms | Standard NDA terms extracted with **value, page #, and a confidence %** (e.g. Governing Law = Delaware) | ☐ |
| B3 | Add a custom term (e.g. "Purpose") before processing a contract | Custom term appears in results with a **Custom** badge | ☐ |
| B4 | Repeat B1 with **MSA** + `sample-msa.pdf` | MSA terms extracted (Payment Terms, Liability Cap, Indemnification, Governing Law = New York) | ☐ |
| B5 | Try uploading a non-PDF or a >10 MB file | Rejected with a clear message (before/at upload) | ☐ |

## C. Results — Viewer, Navigation & Editing

| ID | Steps | Expected result | Result |
|----|-------|-----------------|--------|
| C1 | On a results page, click a term's **Page** link | Left viewer scrolls to that page and highlights it | ☐ |
| C2 | Toggle **PDF / Text** tabs | Both render the contract; page navigation works in each | ☐ |
| C3 | Click a term value, edit it, Save | Saves; an **Edited** badge appears on the term | ☐ |
| C4 | Confirm a low-confidence term (if any) | Shows ⚠️ + "verify in the document" warning; term is not hidden | ☐ |
| C5 | Confirm the "Why?" expander on a term | Reveals the verbatim source sentence | ☐ |

## D. Chat & Memory Layer (Lesson 2)

| ID | Steps | Expected result | Result |
|----|-------|-----------------|--------|
| D1 | Ask **"What is the governing law?"** | Grounded answer with a **[Page X]** citation | ☐ |
| D2 | Follow up: **"What does that mean in practice?"** | Answer references the prior turn (in-context memory) | ☐ |
| D3 | **Refresh the page** and reopen the contract | Chat history reloads from Supabase (persistent memory) | ☐ |
| D4 | Ask **"What have I asked you so far?"** | Summarizes the conversation; tagged **From conversation** (history retrieval) | ☐ |
| D5 | Ask something not in the document (e.g. "What's the CEO's salary?") | Replies "I cannot find this in the document." (no hallucination) | ☐ |

## E. Dashboard, History & Delete

| ID | Steps | Expected result | Result |
|----|-------|-----------------|--------|
| E1 | Return to `/dashboard` after processing contracts | Summary cards show totals (all / NDA / MSA) + a history table | ☐ |
| E2 | Click a column header (Contract / Type / Uploaded) | List re-sorts | ☐ |
| E3 | Click a history row | Opens that contract's results page | ☐ |
| E4 | Delete a contract (confirm the dialog) | Row disappears; contract + related rows gone in Supabase | ☐ |

## F. Feedback

| ID | Steps | Expected result | Result |
|----|-------|-----------------|--------|
| F1 | On a results page, choose 👍/👎, add a comment, Submit | "Thanks for your feedback"; row written to `user_feedback` | ☐ |

## G. Data Integrity (Supabase Table Editor)

| ID | Steps | Expected result | Result |
|----|-------|-----------------|--------|
| G1 | After B1/B4, check `contracts` + `key_terms` | Rows exist with your `user_id`, correct type, and extracted terms | ☐ |
| G2 | After D1–D4, check `chat_sessions` + `chat_messages` | One session per contract; user + assistant messages persisted | ☐ |
| G3 | Sign in as a **second** user; try to view user 1's contract URL | Not visible / not found (RLS isolation) | ☐ |

---

## Sign-off
- **Blocking issues (P0):** any Fail in A2, A5, B1, D3, or G3.
- Tester: __________________  Date: __________  Overall: ☐ Pass ☐ Pass w/ notes ☐ Fail
