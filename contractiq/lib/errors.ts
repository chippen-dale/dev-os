// Typed application errors → consistent HTTP envelope. No silent failures.
// Envelope: { error: { code, message, retryable?, fields? } }
import { ZodError } from 'zod'

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public retryable = false,
    public fields?: Record<string, string>,
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function toErrorResponse(err: unknown): Response {
  if (err instanceof ZodError) {
    const fields: Record<string, string> = {}
    for (const issue of err.issues) fields[String(issue.path[0] ?? 'form')] = issue.message
    return Response.json(
      { error: { code: 'VALIDATION', message: 'Please correct the highlighted fields.', fields } },
      { status: 400 },
    )
  }
  if (err instanceof AppError) {
    return Response.json(
      { error: { code: err.code, message: err.message, retryable: err.retryable, fields: err.fields } },
      { status: err.status },
    )
  }
  // Unknown/unexpected — never leak internals.
  return Response.json(
    { error: { code: 'INTERNAL', message: 'Something went wrong. Please try again.' } },
    { status: 500 },
  )
}

// Named factories
export const unauthorized = () => new AppError('UNAUTHORIZED', 'You must be signed in.', 401)
export const notFound = (what = 'Resource') => new AppError('NOT_FOUND', `${what} not found.`, 404)
export const validation = (fields: Record<string, string>) =>
  new AppError('VALIDATION', 'Please correct the highlighted fields.', 400, false, fields)
export const payloadTooLarge = (msg = 'File is too large.') => new AppError('PAYLOAD_TOO_LARGE', msg, 413)
export const scannedPdf = () =>
  new AppError('SCANNED_PDF', 'Scanned PDFs are not supported yet. Please upload a text-based PDF.', 422)
export const contractTooLong = (msg: string) => new AppError('CONTRACT_TOO_LONG', msg, 422)
export const conflict = (msg: string) => new AppError('CONFLICT', msg, 409)
export const openAiFailed = () =>
  new AppError('OPENAI_FAILED', 'The AI service is temporarily unavailable. Please try again.', 502, true)
export const rateLimited = () =>
  new AppError('RATE_LIMITED', 'Too many requests. Please wait a moment and try again.', 429, true)
