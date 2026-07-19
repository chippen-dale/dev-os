import { Card } from '@/components/ui/Card'

export function SummaryCards({ totals }: { totals: { all: number; nda: number; msa: number } }) {
  const items = [
    { label: 'Contracts reviewed', value: totals.all },
    { label: 'NDAs', value: totals.nda },
    { label: 'MSAs', value: totals.msa },
  ]
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label} className="flex flex-col gap-1">
          <span className="text-h2 font-bold text-brand">{item.value}</span>
          <span className="text-body text-ink-secondary">{item.label}</span>
        </Card>
      ))}
    </div>
  )
}
