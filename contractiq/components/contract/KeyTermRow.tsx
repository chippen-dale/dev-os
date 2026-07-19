'use client'

import { useState } from 'react'
import type { KeyTerm } from '@/lib/types'
import { ConfidenceBadge } from './ConfidenceBadge'
import { Button } from '@/components/ui/Button'

export function KeyTermRow({
  term,
  onNavigate,
  onUpdated,
}: {
  term: KeyTerm
  onNavigate: (page: number) => void
  onUpdated: (updated: KeyTerm) => void
}) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(term.value ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const lowConfidence = term.confidence_score != null && term.confidence_score < 0.5

  async function save() {
    const v = value.trim()
    if (!v) {
      setError('Value cannot be empty.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/key-terms/${term.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: v }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error?.message ?? 'Could not save.')
      onUpdated(json as KeyTerm)
      setEditing(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <li className="flex flex-col gap-2 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="flex flex-wrap items-center gap-2 text-body font-medium text-ink">
            {term.term_name}
            {term.is_custom && (
              <span className="rounded-badge bg-brand-50 px-1.5 py-0.5 text-caption text-brand-700">Custom</span>
            )}
            {term.is_edited && (
              <span className="rounded-badge bg-gray-50 px-1.5 py-0.5 text-caption text-ink-secondary">Edited</span>
            )}
          </span>

          {editing ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={value}
                rows={2}
                onChange={(e) => setValue(e.target.value)}
                className="w-full resize-none rounded-input border border-gray-100 bg-white px-2 py-1 text-body text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
              />
              {error && <span className="text-caption text-danger-700">{error}</span>}
              <div className="flex gap-2">
                <Button onClick={save} loading={saving} className="px-3 py-1 text-caption">
                  Save
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setEditing(false)
                    setValue(term.value ?? '')
                    setError(null)
                  }}
                  className="px-3 py-1 text-caption"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditing(true)}
              title="Click to edit"
              className="text-left text-body text-ink-secondary hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {term.value ? term.value : '—'}
            </button>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <ConfidenceBadge score={term.confidence_score} />
          {term.page_number ? (
            <button
              type="button"
              onClick={() => onNavigate(term.page_number as number)}
              className="text-caption text-brand hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              Page {term.page_number}
            </button>
          ) : (
            <span className="text-caption text-gray-300">No page</span>
          )}
        </div>
      </div>

      {lowConfidence && (
        <p className="rounded-input bg-danger-50 px-2 py-1 text-caption text-danger-700">
          ⚠️ Low confidence — verify this in the document directly.
        </p>
      )}

      {term.source_sentence && (
        <details className="text-caption text-ink-secondary">
          <summary className="cursor-pointer text-brand hover:text-brand-600">Why?</summary>
          <p className="mt-1 border-l-2 border-gray-100 pl-3 italic">“{term.source_sentence}”</p>
        </details>
      )}
    </li>
  )
}
