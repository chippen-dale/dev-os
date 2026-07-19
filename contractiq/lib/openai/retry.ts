import 'server-only'

// Retry with exponential backoff (250ms → 1s → 2s). Rethrows the last error.
export async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown
  const delays = [250, 1000, 2000]
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, delays[Math.min(i, delays.length - 1)]))
      }
    }
  }
  throw lastError
}
