import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

// Elevated surface: white on grey-25 page, flat (border, no shadow) per design.md.
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-card border border-gray-100 bg-white p-6', className)} {...props} />
}
