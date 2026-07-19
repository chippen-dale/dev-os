'use client'

import { useState } from 'react'
import type { KeyTerm } from '@/lib/types'
import { KeyTermRow } from './KeyTermRow'

export function KeyTermsPanel({
  initialTerms,
  onNavigate,
}: {
  initialTerms: KeyTerm[]
  onNavigate: (page: number) => void
}) {
  const [terms, setTerms] = useState<KeyTerm[]>(initialTerms)

  function updateTerm(updated: KeyTerm) {
    setTerms((list) => list.map((t) => (t.id === updated.id ? updated : t)))
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-h5 font-medium text-ink">Key terms</h2>
      <ul className="flex flex-col divide-y divide-gray-50 overflow-hidden rounded-card border border-gray-100 bg-white">
        {terms.map((term) => (
          <KeyTermRow key={term.id} term={term} onNavigate={onNavigate} onUpdated={updateTerm} />
        ))}
        {terms.length === 0 && <li className="p-4 text-body text-ink-secondary">No key terms were extracted.</li>}
      </ul>
    </div>
  )
}
