import 'server-only'
import { extractText, getDocumentProxy } from 'unpdf'
import { scannedPdf } from '@/lib/errors'

// Extracts text from a text-layer PDF, inserting 1-indexed [PAGE N] markers
// before each page. Uses unpdf (serverless-friendly pdfjs build) so it runs
// on Vercel/serverless without native bundling issues.
// Throws ScannedPdfError if the doc has < 100 words.
export async function extractPdfText(data: Uint8Array): Promise<{ text: string; pageCount: number }> {
  const pdf = await getDocumentProxy(data)
  const { totalPages, text } = await extractText(pdf, { mergePages: false })
  const pages = Array.isArray(text) ? text : [text]

  const fullText = pages.length
    ? pages.map((t, i) => `[PAGE ${i + 1}]\n${(t ?? '').trim()}`).join('\n\n')
    : `[PAGE 1]\n${String(text ?? '').trim()}`

  const pageCount = totalPages || pages.length || 1

  const wordCount = fullText
    .replace(/\[PAGE \d+\]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length

  if (wordCount < 100) throw scannedPdf()

  return { text: fullText, pageCount }
}

// Rough token estimate (~4 chars/token) — used to enforce the context limit.
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}
