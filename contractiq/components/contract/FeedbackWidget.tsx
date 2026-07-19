'use client'

import { useState } from 'react'
import type { FeedbackRating } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export function FeedbackWidget({ contractId }: { contractId: string }) {
  const [rating, setRating] = useState<FeedbackRating | null>(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (!rating) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/contracts/${contractId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: comment.trim() || undefined }),
      })
      if (!res.ok) throw new Error('Could not submit feedback.')
      setDone(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit feedback.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-card border border-gray-100 bg-white p-4 text-body text-ink-secondary">
        Thanks for your feedback.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 rounded-card border border-gray-100 bg-white p-4">
      <span className="text-body font-medium text-ink">Was this review accurate?</span>
      <div className="flex gap-2">
        {(['up', 'down'] as FeedbackRating[]).map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={rating === r}
            onClick={() => setRating(r)}
            className={cn(
              'rounded-btn border px-3 py-1.5 text-body transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
              rating === r ? 'border-brand bg-brand-50 text-brand' : 'border-gray-100 text-ink-secondary hover:text-ink',
            )}
          >
            {r === 'up' ? '👍 Yes' : '👎 No'}
          </button>
        ))}
      </div>
      {rating && (
        <>
          <textarea
            value={comment}
            rows={2}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment (optional)"
            className="resize-none rounded-input border border-gray-100 bg-white px-3 py-2 text-body text-ink placeholder:text-gray-300 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
          />
          {error && <span className="text-caption text-danger-700">{error}</span>}
          <Button onClick={submit} loading={submitting} className="self-start">
            Submit feedback
          </Button>
        </>
      )}
    </div>
  )
}
