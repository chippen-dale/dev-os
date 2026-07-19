import 'server-only'
import { getOpenAI } from './client'
import { withRetry } from './retry'
import { CLASSIFIER_SYSTEM, ANSWER_SYSTEM } from './prompts/chat'
import { openAiFailed } from '@/lib/errors'
import { OPENAI_MODEL } from '@/lib/env'
import type { ChatMessage, MessageSource } from '@/lib/types'

const CLASSIFIER_MODEL = 'gpt-4o-mini'

// Lesson 2, step 1 — classify the question. No history → always CONTRACT (nothing to reference).
export async function classifyQuestion(question: string, hasHistory: boolean): Promise<MessageSource> {
  if (!hasHistory) return 'contract'
  try {
    const res = await withRetry(() =>
      getOpenAI().chat.completions.create({
        model: CLASSIFIER_MODEL,
        messages: [
          { role: 'system', content: CLASSIFIER_SYSTEM },
          { role: 'user', content: question },
        ],
        temperature: 0,
        max_tokens: 3,
      }),
    )
    const label = (res.choices[0]?.message?.content ?? '').trim().toUpperCase()
    if (label.includes('HISTORY')) return 'history'
    if (label.includes('BOTH')) return 'both'
    return 'contract'
  } catch {
    // Classifier is best-effort; fall back to the safest (grounded) default.
    return 'contract'
  }
}

// Lesson 2, steps 2–3 — generate the answer from the retrieved context with the matched system prompt.
export async function generateAnswer(args: {
  classification: MessageSource
  contractText: string
  history: ChatMessage[]
  question: string
}): Promise<string> {
  const { classification, contractText, history, question } = args

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: ANSWER_SYSTEM[classification] },
  ]
  if (classification !== 'history') {
    messages.push({ role: 'system', content: `CONTRACT TEXT (with [PAGE N] markers):\n${contractText}` })
  }
  for (const m of history) messages.push({ role: m.role, content: m.content })
  messages.push({ role: 'user', content: question })

  const res = await withRetry(() =>
    getOpenAI().chat.completions.create({
      model: OPENAI_MODEL,
      messages,
      temperature: 0.4,
      max_tokens: 1000,
    }),
  )
  const content = res.choices[0]?.message?.content?.trim()
  if (!content) throw openAiFailed()
  return content
}

// Parse the [Page X] citation from an answer, if present.
export function parseCitationPage(content: string): number | null {
  const match = content.match(/\[Page\s+(\d+)\]/i)
  return match ? Number(match[1]) : null
}
