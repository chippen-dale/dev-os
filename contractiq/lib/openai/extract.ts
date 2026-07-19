import 'server-only'
import { getOpenAI } from './client'
import { buildExtractionMessages, type BuildArgs } from './prompts/extraction'
import { withRetry } from './retry'
import { openAiFailed } from '@/lib/errors'
import { OPENAI_MODEL } from '@/lib/env'

export interface ExtractedTerm {
  term_name: string
  value: string
  page_number: number | null
  confidence_score: number | null
  source_sentence: string | null
}

function tryParseTerms(content: string): ExtractedTerm[] | null {
  try {
    const obj = JSON.parse(content)
    const arr = Array.isArray(obj) ? obj : obj?.terms
    if (!Array.isArray(arr)) return null
    return arr
      .filter((t) => t && typeof t.term_name === 'string')
      .map((t) => ({
        term_name: String(t.term_name),
        value: t.value == null ? '' : String(t.value),
        page_number: normalizePage(t.page_number),
        confidence_score: normalizeConfidence(t.confidence_score),
        source_sentence: t.source_sentence == null ? '' : String(t.source_sentence),
      }))
  } catch {
    return null
  }
}

function normalizePage(v: unknown): number | null {
  const n = Number(v)
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : null
}

function normalizeConfidence(v: unknown): number | null {
  const n = Number(v)
  if (!Number.isFinite(n)) return null
  return Math.min(1, Math.max(0, n))
}

// Runs GPT-4o extraction with one corrective retry on bad JSON.
// Throws AppError('OPENAI_FAILED') on exhaustion (retryable).
export async function extractKeyTerms(args: BuildArgs): Promise<ExtractedTerm[]> {
  const client = getOpenAI()
  const messages = buildExtractionMessages(args)

  const first = await withRetry(() =>
    client.chat.completions.create({
      model: OPENAI_MODEL,
      messages,
      temperature: 0.1,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
    }),
  )
  const firstContent = first.choices[0]?.message?.content ?? ''
  let parsed = tryParseTerms(firstContent)

  if (!parsed) {
    const retry = await withRetry(() =>
      client.chat.completions.create({
        model: OPENAI_MODEL,
        messages: [
          ...messages,
          { role: 'assistant', content: firstContent },
          {
            role: 'user',
            content:
              'Your previous response was not valid JSON. Return ONLY a JSON object with a "terms" array, no explanation.',
          },
        ],
        temperature: 0.1,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    )
    parsed = tryParseTerms(retry.choices[0]?.message?.content ?? '')
  }

  if (!parsed) throw openAiFailed()
  return parsed
}
