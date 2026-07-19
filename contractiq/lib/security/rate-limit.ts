import 'server-only'
import { rateLimited } from '@/lib/errors'

// In-memory per-user fixed-window limiter. NOTE: resets on serverless cold start;
// acceptable for MVP. Swap for Upstash/Redis in Stage 7 (security-foundation).
const buckets = new Map<string, { count: number; reset: number }>()

const PER_MINUTE: Record<string, number> = { process: 10, chat: 30 }

export function checkRateLimit(userId: string, key: 'process' | 'chat'): void {
  const limit = PER_MINUTE[key]
  const now = Date.now()
  const id = `${key}:${userId}`
  const bucket = buckets.get(id)

  if (!bucket || now > bucket.reset) {
    buckets.set(id, { count: 1, reset: now + 60_000 })
    return
  }
  if (bucket.count >= limit) throw rateLimited()
  bucket.count += 1
}
