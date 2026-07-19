'use client'

import type { ContractType } from '@/lib/types'
import { STANDARD_TERMS, CONTRACT_TYPE_LABELS } from '@/lib/contract-terms'
import { CustomTermAdder } from './CustomTermAdder'

export function PreProcessingPreview({
  contractType,
  customTerms,
  onAddTerm,
  onRemoveTerm,
}: {
  contractType: ContractType
  customTerms: string[]
  onAddTerm: (term: string) => void
  onRemoveTerm: (index: number) => void
}) {
  return (
    <div className="flex flex-col gap-6 rounded-card border border-gray-100 bg-white p-5">
      <div className="flex flex-col gap-3">
        <span className="text-body font-medium text-ink">
          ContractIQ will look for these {CONTRACT_TYPE_LABELS[contractType]} terms
        </span>
        <ul className="flex flex-wrap gap-2">
          {STANDARD_TERMS[contractType].map((term) => (
            <li
              key={term}
              className="rounded-badge border border-gray-100 bg-gray-25 px-2 py-1 text-caption text-ink-secondary"
            >
              {term}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-3 border-t border-gray-50 pt-5">
        <div className="flex flex-col gap-1">
          <span className="text-body font-medium text-ink">Add custom terms (optional)</span>
          <span className="text-caption text-ink-secondary">
            Extract clauses specific to your situation — up to 5.
          </span>
        </div>
        <CustomTermAdder terms={customTerms} onAdd={onAddTerm} onRemove={onRemoveTerm} />
      </div>
    </div>
  )
}
