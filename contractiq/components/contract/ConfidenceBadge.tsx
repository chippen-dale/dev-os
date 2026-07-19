import { cn } from '@/lib/utils'

// Confidence tiers (engineering-doc §8.5): green ≥80, amber 50–79, red <50.
// Color is never the only signal — low confidence also carries a ⚠️.
export function ConfidenceBadge({ score }: { score: number | null }) {
  if (score == null) {
    return (
      <span className="inline-flex items-center rounded-badge border border-gray-100 bg-gray-25 px-2 py-0.5 text-caption font-medium text-ink-secondary">
        N/A
      </span>
    )
  }
  const pct = Math.round(score * 100)
  const tier = score >= 0.8 ? 'high' : score >= 0.5 ? 'med' : 'low'
  const styles = {
    high: 'bg-success-50 border-success-200 text-success-700',
    med: 'bg-warning-50 border-warning-200 text-warning-800',
    low: 'bg-danger-50 border-danger-200 text-danger-700',
  }[tier]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-badge border px-2 py-0.5 text-caption font-medium',
        styles,
      )}
      title={tier === 'low' ? 'Low confidence — verify this in the document directly.' : undefined}
    >
      {tier === 'low' && <span aria-hidden>⚠️</span>}
      {pct}%
    </span>
  )
}
