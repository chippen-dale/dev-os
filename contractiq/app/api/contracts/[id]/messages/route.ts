import type { NextRequest } from 'next/server'
import { requireUser } from '@/lib/auth/getUser'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { toErrorResponse, notFound } from '@/lib/errors'
import type { ChatMessage } from '@/lib/types'

// GET /api/contracts/[id]/messages — load the persisted conversation (ascending).
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireUser()
    const supabase = createSupabaseServerClient()

    const { data: contract } = await supabase.from('contracts').select('id').eq('id', params.id).single()
    if (!contract) throw notFound('Contract')

    const { data: session } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('contract_id', contract.id)
      .maybeSingle()

    if (!session) return Response.json({ session_id: null, messages: [] })

    const { data: messages } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true })
      .returns<ChatMessage[]>()

    return Response.json({ session_id: session.id, messages: messages ?? [] })
  } catch (err) {
    return toErrorResponse(err)
  }
}
