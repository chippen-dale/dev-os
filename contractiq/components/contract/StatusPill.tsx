import type { ContractStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

// Status badge (design.md status pattern: bg-50 / border-200 / text-700-800).
const STYLES: Record<ContractStatus, string> = {
  uploaded: 'bg-gray-50 border-gray-100 text-ink-secondary',
  processing: 'bg-warning-50 border-warning-200 text-warning-800',
  complete: 'bg-success-50 border-success-200 text-success-700',
  error: 'bg-danger-50 border-danger-200 text-danger-700',
}

const LABELS: Record<ContractStatus, string> = {
  uploaded: 'Uploaded',
  processing: 'Processing',
  complete: 'Complete',
  error: 'Error',
}

export function StatusPill({ status }: { status: ContractStatus }) {
  return (
    <span className={cn('inline-flex items-center rounded-badge border px-2 py-0.5 text-caption font-medium', STYLES[status])}>
      {LABELS[status]}
    </span>
  )
}
