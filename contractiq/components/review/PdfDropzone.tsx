'use client'

import { useRef, useState, type DragEvent } from 'react'
import { MAX_UPLOAD_MB } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function PdfDropzone({
  file,
  onSelect,
  error,
}: {
  file: File | null
  onSelect: (file: File | null, error?: string) => void
  error?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function validate(f: File): string | undefined {
    if (f.type !== 'application/pdf') return 'File must be a PDF.'
    if (f.size > MAX_UPLOAD_MB * 1024 * 1024) return `File exceeds the ${MAX_UPLOAD_MB} MB limit.`
    return undefined
  }

  function handleFiles(files: FileList | null) {
    const f = files?.[0]
    if (!f) return
    const err = validate(f)
    onSelect(err ? null : f, err)
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-body font-medium text-ink">Contract PDF</span>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed px-6 py-10 text-center transition-colors duration-100 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
          error ? 'border-danger bg-danger-50' : dragging ? 'border-brand bg-brand-50' : 'border-gray-100 bg-white hover:border-brand',
        )}
      >
        {file ? (
          <>
            <span className="text-body font-medium text-ink">{file.name}</span>
            <span className="text-caption text-ink-secondary">
              {(file.size / 1024 / 1024).toFixed(2)} MB · click to replace
            </span>
          </>
        ) : (
          <>
            <span className="text-body font-medium text-ink">Drop a PDF here, or click to browse</span>
            <span className="text-caption text-ink-secondary">Text-based PDF · up to {MAX_UPLOAD_MB} MB · 20 pages</span>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && <p className="text-caption text-danger-700">{error}</p>}
    </div>
  )
}
