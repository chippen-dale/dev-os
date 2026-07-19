'use client'

import type { ContractType } from '@/lib/types'
import { cn } from '@/lib/utils'

const OPTIONS: { value: ContractType; label: string; hint: string }[] = [
  { value: 'nda', label: 'NDA', hint: 'Non-Disclosure Agreement' },
  { value: 'msa', label: 'MSA', hint: 'Master Service Agreement' },
]

export function ContractTypeSelect({
  value,
  onChange,
}: {
  value: ContractType | null
  onChange: (v: ContractType) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-body font-medium text-ink">Contract type</span>
      <div className="grid grid-cols-2 gap-3">
        {OPTIONS.map((opt) => {
          const active = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(opt.value)}
              className={cn(
                'flex flex-col items-start rounded-card border px-4 py-3 text-left transition-colors duration-100 ease-out',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
                active ? 'border-brand bg-brand-50' : 'border-gray-100 bg-white hover:border-gray-200',
              )}
            >
              <span className="text-body font-semibold text-ink">{opt.label}</span>
              <span className="text-caption text-ink-secondary">{opt.hint}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
