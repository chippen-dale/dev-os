'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { TextViewer } from './TextViewer'
import { cn } from '@/lib/utils'

// PDF.js only in the browser — never SSR it.
const PdfViewer = dynamic(() => import('./PdfViewer').then((m) => m.PdfViewer), {
  ssr: false,
})

type Mode = 'pdf' | 'text'

export function ContractViewerPanel({
  signedUrl,
  contractText,
  targetPage,
}: {
  signedUrl: string | null
  contractText: string
  targetPage: number | null
}) {
  const [mode, setMode] = useState<Mode>(signedUrl ? 'pdf' : 'text')
  const [pdfFailed, setPdfFailed] = useState(false)

  // If the PDF viewer fails at runtime, fall back to text automatically.
  useEffect(() => {
    if (pdfFailed) setMode('text')
  }, [pdfFailed])

  const pdfAvailable = !!signedUrl && !pdfFailed

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-card border border-gray-100 bg-white">
      <div className="flex items-center gap-2 border-b border-gray-50 px-3 py-2">
        <span className="mr-auto text-body font-medium text-ink">Contract</span>
        <Tab active={mode === 'pdf'} disabled={!pdfAvailable} onClick={() => setMode('pdf')}>
          PDF
        </Tab>
        <Tab active={mode === 'text'} onClick={() => setMode('text')}>
          Text
        </Tab>
      </div>
      <div className="flex-1 overflow-hidden">
        {mode === 'pdf' && pdfAvailable ? (
          <PdfViewer url={signedUrl as string} targetPage={targetPage} onError={() => setPdfFailed(true)} />
        ) : (
          <TextViewer text={contractText} targetPage={targetPage} />
        )}
      </div>
    </div>
  )
}

function Tab({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'rounded-btn px-3 py-1 text-caption font-medium transition-colors duration-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
        active ? 'bg-brand-50 text-brand' : 'text-ink-secondary hover:text-ink',
        disabled && 'cursor-not-allowed opacity-40 hover:text-ink-secondary',
      )}
    >
      {children}
    </button>
  )
}
