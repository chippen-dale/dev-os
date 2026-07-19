import type { ContractType } from '@/lib/types'
import { STANDARD_TERMS, CONTRACT_TYPE_LABELS } from '@/lib/contract-terms'
import type OpenAI from 'openai'

type ChatMessage = OpenAI.Chat.Completions.ChatCompletionMessageParam

export interface BuildArgs {
  contractText: string
  contractType: ContractType
  customTerms: string[]
}

// Grounded, JSON-mode extraction prompt. The model must answer ONLY from the
// provided document text and self-report a confidence score per term.
export function buildExtractionMessages({ contractText, contractType, customTerms }: BuildArgs): ChatMessage[] {
  const label = CONTRACT_TYPE_LABELS[contractType]
  const targetTerms = [...STANDARD_TERMS[contractType], ...customTerms]

  const system = [
    `You are ContractIQ, an expert legal analyst that extracts key terms from ${label} contracts.`,
    `The contract text is provided with [PAGE N] markers indicating page boundaries (1-indexed).`,
    '',
    'RULES:',
    '- Answer ONLY from the provided document text. Never use outside legal knowledge.',
    '- For each requested term, return its value exactly as stated or clearly implied in the document.',
    '- page_number: the 1-indexed page (from the nearest preceding [PAGE N] marker) where the value appears.',
    '- confidence_score: your calibrated confidence from 0.0 to 1.0 that the value is correct.',
    '- source_sentence: the verbatim sentence from the contract the value was drawn from.',
    '- If a term is NOT present in the document, still include it with value "", confidence_score below 0.3, page_number null, and source_sentence "".',
    '- Do not invent terms that were not requested.',
    '',
    'Return ONLY a JSON object of the form:',
    '{ "terms": [ { "term_name": string, "value": string, "page_number": number|null, "confidence_score": number, "source_sentence": string } ] }',
    '',
    'Example item:',
    '{ "term_name": "Governing Law", "value": "State of Delaware", "page_number": 4, "confidence_score": 0.94, "source_sentence": "This Agreement shall be governed by the laws of the State of Delaware." }',
  ].join('\n')

  const user = [
    `Contract type: ${label}`,
    `Extract these terms (return one object per term, in this order): ${targetTerms.join(', ')}`,
    '',
    'CONTRACT TEXT:',
    contractText,
  ].join('\n')

  return [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ]
}
