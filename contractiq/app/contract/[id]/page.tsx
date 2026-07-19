import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { getUser } from '@/lib/auth/getUser'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { STORAGE_BUCKET, LIMITS } from '@/lib/env'
import { CONTRACT_TYPE_LABELS } from '@/lib/contract-terms'
import { ResultsView } from '@/components/contract/ResultsView'
import type { Contract, KeyTerm, ChatMessage, ContractType } from '@/lib/types'

export default async function ContractPage({ params }: { params: { id: string } }) {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = createSupabaseServerClient()
  const { data: contract } = await supabase.from('contracts').select('*').eq('id', params.id).single<Contract>()
  if (!contract) notFound()

  const { data: terms } = await supabase
    .from('key_terms')
    .select('*')
    .eq('contract_id', contract.id)
    .order('created_at', { ascending: true })
    .returns<KeyTerm[]>()

  // 1-hour signed URL for the PDF viewer (when Storage upload succeeded).
  let signedUrl: string | null = null
  if (contract.file_path) {
    const { data } = await createSupabaseAdminClient()
      .storage.from(STORAGE_BUCKET)
      .createSignedUrl(contract.file_path, LIMITS.signedUrlTtl)
    signedUrl = data?.signedUrl ?? null
  }

  // Persisted conversation (reloads on refresh).
  const { data: session } = await supabase
    .from('chat_sessions')
    .select('id')
    .eq('contract_id', contract.id)
    .maybeSingle()
  let initialMessages: ChatMessage[] = []
  if (session) {
    const { data: msgs } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true })
      .returns<ChatMessage[]>()
    initialMessages = msgs ?? []
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

      <section className="mx-auto flex max-w-6xl flex-col gap-6 px-8 py-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-h3 font-semibold text-ink">{contract.file_name}</h1>
          <p className="text-body text-ink-secondary">
            {CONTRACT_TYPE_LABELS[contract.contract_type as ContractType]} · {contract.page_count} pages ·{' '}
            <span className="capitalize">{contract.status}</span>
          </p>
        </div>

        {contract.status === 'processing' && (
          <div className="rounded-card border border-warning-200 bg-warning-50 px-4 py-3 text-body text-warning-800">
            Still analysing this contract — refresh in a moment.
          </div>
        )}
        {contract.status === 'error' && (
          <div className="rounded-card border border-danger-200 bg-danger-50 px-4 py-3 text-body text-danger-700">
            Something went wrong while analysing this contract. Please try processing it again.
          </div>
        )}

        <ResultsView
          contract={contract}
          terms={terms ?? []}
          signedUrl={signedUrl}
          initialMessages={initialMessages}
        />

        <p className="border-t border-gray-50 pt-4 text-caption text-gray-300">
          This is an AI-assisted review tool, not legal advice. Always verify critical terms with a qualified lawyer.
        </p>
      </section>
    </main>
  )
}
