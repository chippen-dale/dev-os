'use client'

import { useState } from 'react'
import type { Contract, KeyTerm, ChatMessage } from '@/lib/types'
import { ContractViewerPanel } from './ContractViewerPanel'
import { KeyTermsPanel } from './KeyTermsPanel'
import { FeedbackWidget } from './FeedbackWidget'
import { ChatPanel } from '@/components/chat/ChatPanel'

// Two-panel results: contract (left) + key terms / feedback / chat (right).
// Shared targetPage lets a key-term page click scroll the viewer.
export function ResultsView({
  contract,
  terms,
  signedUrl,
  initialMessages,
}: {
  contract: Contract
  terms: KeyTerm[]
  signedUrl: string | null
  initialMessages: ChatMessage[]
}) {
  const [targetPage, setTargetPage] = useState<number | null>(null)

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="lg:sticky lg:top-6 lg:h-[44rem]">
        <ContractViewerPanel
          signedUrl={signedUrl}
          contractText={contract.contract_text}
          targetPage={targetPage}
        />
      </div>

      <div className="flex flex-col gap-6">
        <KeyTermsPanel initialTerms={terms} onNavigate={setTargetPage} />
        <FeedbackWidget contractId={contract.id} />
        <div className="flex flex-col gap-3">
          <h2 className="text-h5 font-medium text-ink">Chat</h2>
          <ChatPanel contractId={contract.id} initialMessages={initialMessages} />
        </div>
      </div>
    </div>
  )
}
