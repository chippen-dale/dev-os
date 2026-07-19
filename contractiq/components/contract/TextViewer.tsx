'use client'

import { useEffect, useMemo, useRef } from 'react'
import { cn } from '@/lib/utils'

// Fallback viewer — parses [PAGE N] markers from contract_text into labelled
// page sections. Always available (no Storage / signed URL needed).
export function TextViewer({ text, targetPage }: { text: string; targetPage: number | null }) {
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({})

  const pages = useMemo(() => {
    const parts = text.split(/\[PAGE\s+(\d+)\]/)
    const out: { n: number; content: string }[] = []
    for (let i = 1; i < parts.length; i += 2) {
      out.push({ n: Number(parts[i]), content: (parts[i + 1] ?? '').trim() })
    }
    return out.length ? out : [{ n: 1, content: text.trim() }]
  }, [text])

  useEffect(() => {
    if (!targetPage) return
    const el = pageRefs.current[targetPage]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      el.classList.add('ring-2', 'ring-brand')
      const t = setTimeout(() => el.classList.remove('ring-2', 'ring-brand'), 1500)
      return () => clearTimeout(t)
    }
  }, [targetPage])

  return (
    <div className="h-full overflow-y-auto bg-gray-25 p-4">
      <div className="flex flex-col gap-4">
        {pages.map((page) => (
          <div
            key={page.n}
            ref={(el) => {
              pageRefs.current[page.n] = el
            }}
            className={cn('rounded-card border border-gray-100 bg-white p-4 transition-shadow duration-150')}
          >
            <div className="mb-2 text-caption font-medium uppercase text-ink-secondary">Page {page.n}</div>
            <p className="whitespace-pre-wrap text-body text-ink">{page.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
