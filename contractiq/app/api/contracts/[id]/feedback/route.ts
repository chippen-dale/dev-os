import type { NextRequest } from 'next/server'
import { requireUser } from '@/lib/auth/getUser'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { feedbackSchema } from '@/lib/validation/feedback'
import { AppError, toErrorResponse, notFound } from '@/lib/errors'
import type { Feedback } from '@/lib/types'

// POST /api/contracts/[id]/feedback — thumbs up/down + optional comment.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser()
    const { rating, comment } = feedbackSchema.parse(await req.json())
    const supabase = createSupabaseServerClient()

    const { data: contract } = await supabase.from('contracts').select('id').eq('id', params.id).single()
    if (!contract) throw notFound('Contract')

    const { data: created, error } = await supabase
      .from('user_feedback')
      .insert({ contract_id: contract.id, user_id: user.id, rating, comment: comment || null })
      .select('*')
      .single<Feedback>()
    if (error || !created) throw new AppError('DB_INSERT', 'Could not save your feedback.', 500)

    return Response.json(created, { status: 201 })
  } catch (err) {
    return toErrorResponse(err)
  }
}
