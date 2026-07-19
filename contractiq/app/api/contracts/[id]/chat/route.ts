import type { NextRequest } from 'next/server'
import { requireUser } from '@/lib/auth/getUser'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/security/rate-limit'
import { chatSchema } from '@/lib/validation/chat'
import { ensureSession, loadHistory, windowHistory, saveMessage } from '@/lib/memory'
import { classifyQuestion, generateAnswer, parseCitationPage } from '@/lib/openai/chat'
import { toErrorResponse, notFound } from '@/lib/errors'

export const runtime = 'nodejs'
export const maxDuration = 60

// POST /api/contracts/[id]/chat — grounded, memory-aware Q&A (Lesson 2).
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser()
    checkRateLimit(user.id, 'chat')

    const { message } = chatSchema.parse(await req.json())
    const supabase = createSupabaseServerClient()

    const { data: contract, error } = await supabase
      .from('contracts')
      .select('id, contract_text')
      .eq('id', params.id)
      .single()
    if (error || !contract) throw notFound('Contract')

    const sessionId = await ensureSession(supabase, contract.id, user.id)

    // CRITICAL: load history BEFORE saving the new user message.
    const history = await loadHistory(supabase, sessionId)

    // Classify → retrieve windowed context → respond with a matched prompt.
    const classification = await classifyQuestion(message, history.length > 0)
    const contextWindow = windowHistory(history, classification)
    const contractText = classification === 'history' ? '' : (contract.contract_text as string)

    const answer = await generateAnswer({ classification, contractText, history: contextWindow, question: message })
    const citationPage = parseCitationPage(answer)

    // Persist both turns only after a successful answer (so failures are cleanly retryable).
    await saveMessage(supabase, { sessionId, userId: user.id, role: 'user', content: message })
    const assistant = await saveMessage(supabase, { sessionId, userId: user.id, role: 'assistant', content: answer })

    return Response.json({ message: assistant, source: classification, citation_page: citationPage })
  } catch (err) {
    return toErrorResponse(err)
  }
}
