'use client'

import { useEffect, useRef, useState } from 'react'
import type { ChatMessage, MessageSource } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

const SOURCE_LABEL: Record<MessageSource, string> = {
  contract: 'From contract',
  history: 'From conversation',
  both: 'From both',
}

export function ChatPanel({
  contractId,
  initialMessages,
}: {
  contractId: string
  initialMessages: ChatMessage[]
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [sources, setSources] = useState<Record<string, MessageSource>>({})
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    setError(null)
    setInput('')
    setLoading(true)

    const optimistic: ChatMessage = {
      id: `tmp-${messages.length}-${text.length}`,
      session_id: '',
      user_id: '',
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    }
    setMessages((m) => [...m, optimistic])

    try {
      const res = await fetch(`/api/contracts/${contractId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error?.message ?? 'Chat failed.')
      setMessages((m) => [...m, json.message as ChatMessage])
      if (json.source) setSources((s) => ({ ...s, [json.message.id]: json.source }))
    } catch (e) {
      setMessages((m) => m.filter((x) => x.id !== optimistic.id))
      setInput(text)
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-[32rem] flex-col overflow-hidden rounded-card border border-gray-100 bg-white">
      <div className="border-b border-gray-50 px-4 py-3">
        <span className="text-body font-medium text-ink">Chat with this contract</span>
      </div>

      <div ref={listRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="m-auto max-w-xs text-center text-body text-ink-secondary">
            Ask your first question — e.g. “What is the governing law?” or “Is there an auto-renewal clause?”
          </p>
        )}
        {messages.map((m) => {
          const isUser = m.role === 'user'
          const source = sources[m.id]
          return (
            <div key={m.id} className={cn('flex flex-col gap-1', isUser ? 'items-end' : 'items-start')}>
              <div
                className={cn(
                  'max-w-[85%] whitespace-pre-wrap rounded-card px-3 py-2 text-body',
                  isUser ? 'bg-brand-50 text-ink' : 'border border-gray-100 bg-gray-25 text-ink',
                )}
              >
                {m.content}
              </div>
              {!isUser && source && (
                <span className="rounded-badge bg-gray-50 px-2 py-0.5 text-caption text-ink-secondary">
                  {SOURCE_LABEL[source]}
                </span>
              )}
            </div>
          )
        })}
        {loading && <div className="text-caption text-ink-secondary">ContractIQ is thinking…</div>}
      </div>

      {error && <div className="border-t border-danger bg-danger-50 px-4 py-2 text-caption text-danger-700">{error}</div>}

      <div className="flex items-end gap-2 border-t border-gray-50 p-3">
        <textarea
          value={input}
          rows={1}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
          placeholder="Ask a question about this contract…"
          aria-label="Ask a question about this contract"
          className="flex-1 resize-none rounded-input border border-gray-100 bg-white px-3 py-2 text-body text-ink placeholder:text-gray-300 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
        />
        <Button onClick={send} loading={loading} disabled={!input.trim()}>
          Send
        </Button>
      </div>
    </div>
  )
}
