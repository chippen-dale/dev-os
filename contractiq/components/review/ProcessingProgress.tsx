import { cn } from '@/lib/utils'

const STEPS = ['Extracting text', 'Analysing with AI', 'Compiling results']

// currentStep: 1..3 (1-indexed). Steps below it are done, the current one is active.
export function ProcessingProgress({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex flex-col gap-4 rounded-card border border-gray-100 bg-white p-6">
      <span className="text-body font-medium text-ink">Processing your contract…</span>
      <ol className="flex flex-col gap-3">
        {STEPS.map((label, i) => {
          const stepNum = i + 1
          const done = stepNum < currentStep
          const active = stepNum === currentStep
          return (
            <li key={label} className="flex items-center gap-3">
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full border text-caption font-semibold',
                  done && 'border-success bg-success text-white',
                  active && 'border-brand bg-brand-50 text-brand',
                  !done && !active && 'border-gray-100 bg-white text-gray-300',
                )}
              >
                {done ? '✓' : stepNum}
              </span>
              <span className={cn('text-body', active ? 'text-ink' : 'text-ink-secondary')}>
                {label}
                {active && <span className="ml-2 animate-pulse text-brand">•••</span>}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
