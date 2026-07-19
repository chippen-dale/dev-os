import 'server-only'
import { PDFParse } from 'pdf-parse'
import { scannedPdf } from '@/lib/errors'

// Extracts text from a text-layer PDF, inserting 1-indexed [PAGE N] markers
// before each page. Throws ScannedPdfError if the doc has < 100 words.
export async function extractPdfText(data: Uint8Array): Promise<{ text: string; pageCount: number }> {
  const parser = new PDFParse({ data })
  try {
    const result = await parser.getText()
    const pages = result.pages ?? []

    const text = pages.length
      ? pages.map((p, i) => `[PAGE ${i + 1}]\n${(p.text ?? '').trim()}`).join('\n\n')
      : `[PAGE 1]\n${(result.text ?? '').trim()}`

    const pageCount = result.total || pages.length || 1

    const wordCount = text
      .replace(/\[PAGE \d+\]/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean).length

    if (wordCount < 100) throw scannedPdf()

    return { text, pageCount }
  } finally {
    await parser.destroy()
  }
}

// Rough token estimate (~4 chars/token) — used to enforce the context limit.
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}
