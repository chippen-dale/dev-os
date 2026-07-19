import type { NextRequest } from 'next/server'
import { requireUser } from '@/lib/auth/getUser'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { extractKeyTerms } from '@/lib/openai/extract'
import { checkRateLimit } from '@/lib/security/rate-limit'
import { toErrorResponse, notFound, conflict } from '@/lib/errors'
import type { ContractType } from '@/lib/types'

export const runtime = 'nodejs'
export const maxDuration = 60

// POST /api/contracts/[id]/process — run GPT-4o extraction over stored text; persist key_terms.
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser()
    checkRateLimit(user.id, 'process')

    const supabase = createSupabaseServerClient()
    const { data: contract, error } = await supabase
      .from('contracts')
      .select('id, contract_text, contract_type, status')
      .eq('id', params.id)
      .single()

    if (error || !contract) throw notFound('Contract')
    if (contract.status === 'processing') throw conflict('This contract is already being processed.')

    await supabase.from('contracts').update({ status: 'processing' }).eq('id', contract.id)

    try {
      const { data: customRows } = await supabase
        .from('custom_key_terms')
        .select('term_name')
        .eq('contract_id', contract.id)
      const customTerms = (customRows ?? []).map((r) => r.term_name as string)
      const customSet = new Set(customTerms.map((t) => t.toLowerCase()))

      const extracted = await extractKeyTerms({
        contractText: contract.contract_text as string,
        contractType: contract.contract_type as ContractType,
        customTerms,
      })

      const rows = extracted.map((t) => ({
        contract_id: contract.id,
        user_id: user.id,
        term_name: t.term_name,
        value: t.value || null,
        page_number: t.page_number,
        confidence_score: t.confidence_score,
        source_sentence: t.source_sentence || null,
        is_custom: customSet.has(t.term_name.toLowerCase()),
      }))

      // Idempotent re-process: clear prior terms, then insert fresh.
      await supabase.from('key_terms').delete().eq('contract_id', contract.id)
      if (rows.length) await supabase.from('key_terms').insert(rows)
      await supabase.from('contracts').update({ status: 'complete' }).eq('id', contract.id)

      const { data: saved } = await supabase
        .from('key_terms')
        .select('*')
        .eq('contract_id', contract.id)
        .order('created_at', { ascending: true })

      return Response.json({ status: 'complete', terms: saved ?? [] })
    } catch (inner) {
      // Leave the contract in 'error' so the user can retry without re-uploading.
      await supabase.from('contracts').update({ status: 'error' }).eq('id', contract.id)
      throw inner
    }
  } catch (err) {
    return toErrorResponse(err)
  }
}
