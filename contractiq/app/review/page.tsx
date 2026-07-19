'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ContractType } from '@/lib/types'
import { ContractTypeSelect } from '@/components/review/ContractTypeSelect'
import { PdfDropzone } from '@/components/review/PdfDropzone'
import { PreProcessingPreview } from '@/components/review/PreProcessingPreview'
import { ProcessingProgress } from '@/components/review/ProcessingProgress'
import { Button } from '@/components/ui/Button'

export default function ReviewPage() {
  const router = useRouter()
  const [type, setType] = useState<ContractType | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | undefined>()
  const [customTerms, setCustomTerms] = useState<string[]>([])
  const [phase, setPhase] = useState<'form' | 'processing'>('form')
  const [step, setStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const canProcess = !!type && !!file

  async function handleProcess() {
    if (!type || !file) return
    setError(null)
    setPhase('processing')
    setStep(1)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('contract_type', type)
      fd.append('custom_terms', JSON.stringify(customTerms))

      const upRes = await fetch('/api/contracts', { method: 'POST', body: fd })
      const upJson = await upRes.json()
      if (!upRes.ok) throw new Error(upJson?.error?.message ?? 'Upload failed.')

      setStep(2)
      const prRes = await fetch(`/api/contracts/${upJson.contract_id}/process`, { method: 'POST' })
      const prJson = await prRes.json()
      if (!prRes.ok) throw new Error(prJson?.error?.message ?? 'Processing failed.')

      setStep(3)
      router.push(`/contract/${upJson.contract_id}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
      setPhase('form')
      setStep(0)
    }
  }

  return (
    <main className="min-h-screen bg-gray-25">
      <header className="flex items-center justify-between border-b border-gray-50 px-8 py-5">
        <Link href="/dashboard" className="text-h5 font-bold text-ink">
          Contract<span className="text-brand">IQ</span>
        </Link>
        <Link href="/dashboard" className="text-body text-brand hover:text-brand-600">
          ← Dashboard
        </Link>
      </header>

      <section className="mx-auto flex max-w-2xl flex-col gap-8 px-8 py-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-h3 font-semibold text-ink">Review a contract</h1>
          <p className="text-body text-ink-secondary">
            Upload an NDA or MSA and ContractIQ will extract its key terms.
          </p>
        </div>

        {phase === 'processing' ? (
          <ProcessingProgress currentStep={step} />
        ) : (
          <div className="flex flex-col gap-8">
            <ContractTypeSelect value={type} onChange={setType} />
            <PdfDropzone
              file={file}
              error={fileError}
              onSelect={(f, err) => {
                setFile(f)
                setFileError(err)
              }}
            />
            {type && (
              <PreProcessingPreview
                contractType={type}
                customTerms={customTerms}
                onAddTerm={(t) => setCustomTerms((prev) => [...prev, t])}
                onRemoveTerm={(i) => setCustomTerms((prev) => prev.filter((_, idx) => idx !== i))}
              />
            )}

            {error && (
              <div className="rounded-input border border-danger bg-danger-50 px-3 py-2 text-body text-danger-700">
                {error}
              </div>
            )}

            <Button onClick={handleProcess} disabled={!canProcess} className="w-full">
              Process Contract
            </Button>
          </div>
        )}
      </section>
    </main>
  )
}
