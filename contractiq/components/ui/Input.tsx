import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const autoId = useId()
    const inputId = id ?? autoId
    const errorId = `${inputId}-error`
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={inputId} className="text-body font-medium text-ink">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'rounded-input border bg-white px-3 py-2.5 text-body text-ink placeholder:text-gray-300',
            'transition-colors duration-100 ease-out',
            'focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand',
            error ? 'border-danger' : 'border-gray-100',
            className,
          )}
          {...props}
        />
        {error && (
          <p id={errorId} className="text-caption text-danger-700">
            {error}
          </p>
        )}
      </div>
    )
  },
)
Input.displayName = 'Input'
