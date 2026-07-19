'use client'

import { useState } from 'react'
import { MAX_CUSTOM_TERMS } from '@/lib/constants'
import { Button } from '@/components/ui/Button'

export function CustomTermAdder({
  terms,
  onAdd,
  onRemove,
}: {
  terms: string[]
  onAdd: (term: string) => void
  onRemove: (index: number) => void
}) {
  const [input, setInput] = useState('')
  const atLimit = terms.length >= MAX_CUSTOM_TERMS

  function add() {
    const trimmed = input.trim()
    if (!trimmed || atLimit) return
    if (terms.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setInput('')
      return
    }
    onAdd(trimmed)
    setInput('')
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-2">
        <input
          type="text"
          value={input}
          disabled={atLimit}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          placeholder={atLimit ? `Limit of ${MAX_CUSTOM_TERMS} reached` : 'e.g. Non-compete radius'}
          aria-label="Add a custom key term"
          className="flex-1 rounded-input border border-gray-100 bg-white px-3 py-2 text-body text-ink placeholder:text-gray-300 transition-colors duration-100 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand disabled:bg-gray-25 disabled:text-gray-400"
        />
        <Button type="button" variant="ghost" onClick={add} disabled={atLimit || !input.trim()}>
          + Add
        </Button>
      </div>
      {terms.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {terms.map((term, i) => (
            <li
              key={`${term}-${i}`}
              className="inline-flex items-center gap-2 rounded-badge border border-brand-200 bg-brand-50 px-2 py-1 text-caption font-medium text-brand-700"
            >
              <span>{term}</span>
              <span className="rounded-badge bg-brand-100 px-1 text-brand-700">Custom</span>
              <button
                type="button"
                onClick={() => onRemove(i)}
                aria-label={`Remove ${term}`}
                className="text-brand-700 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
