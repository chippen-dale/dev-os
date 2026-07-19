'use client'

import { useEffect, useRef, useState } from 'react'
import { Spinner } from '@/components/ui/Spinner'

// Client-only PDF.js viewer. Renders each page to a canvas and scrolls to
// `targetPage`. On any load/render failure, calls onError so the parent can
// fall back to the text viewer. Loaded via next/dynamic (ssr:false).
export function PdfViewer({
  url,
  targetPage,
  onError,
}: {
  url: string
  targetPage: number | null
  onError: () => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pageEls = useRef<Record<number, HTMLDivElement>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const pdfjs = await import('pdfjs-dist')
        // Worker served as a static file from /public (see predev/prebuild scripts).
        // Bundling the .mjs worker breaks Next's minifier, so we host it instead.
        pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

        const pdf = await pdfjs.getDocument({ url }).promise
        if (cancelled) return

        const container = containerRef.current
        if (!container) return
        container.innerHTML = ''
        pageEls.current = {}

        for (let p = 1; p <= pdf.numPages; p++) {
          const page = await pdf.getPage(p)
          if (cancelled) return
          const viewport = page.getViewport({ scale: 1.3 })
          const wrapper = document.createElement('div')
          wrapper.dataset.page = String(p)
          wrapper.className = 'mb-4 flex justify-center transition-shadow duration-150'
          const canvas = document.createElement('canvas')
          canvas.width = viewport.width
          canvas.height = viewport.height
          canvas.className = 'max-w-full rounded-card border border-gray-100'
          wrapper.appendChild(canvas)
          container.appendChild(wrapper)
          pageEls.current[p] = wrapper
          const ctx = canvas.getContext('2d')
          if (ctx) await page.render({ canvas, canvasContext: ctx, viewport }).promise
        }
        if (!cancelled) setLoading(false)
      } catch {
        if (!cancelled) onError()
      }
    })()
    return () => {
      cancelled = true
    }
  }, [url, onError])

  useEffect(() => {
    if (!targetPage) return
    const el = pageEls.current[targetPage]
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      el.classList.add('ring-2', 'ring-brand', 'rounded-card')
      const t = setTimeout(() => el.classList.remove('ring-2', 'ring-brand'), 1500)
      return () => clearTimeout(t)
    }
  }, [targetPage])

  return (
    <div className="relative h-full overflow-y-auto bg-gray-25 p-4">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </div>
      )}
      <div ref={containerRef} />
    </div>
  )
}
