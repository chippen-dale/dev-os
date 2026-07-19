import type { NextRequest } from 'next/server'
import { requireUser } from '@/lib/auth/getUser'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { STORAGE_BUCKET } from '@/lib/env'
import { AppError, toErrorResponse, notFound } from '@/lib/errors'

export const runtime = 'nodejs'

// DELETE /api/contracts/[id] — remove the contract + its PDF. DB cascade removes
// key_terms, custom_key_terms, chat_sessions→chat_messages, and user_feedback.
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser()
    const supabase = createSupabaseServerClient()

    const { data: contract } = await supabase
      .from('contracts')
      .select('id, file_path')
      .eq('id', params.id)
      .single()
    if (!contract) throw notFound('Contract')

    if (contract.file_path) {
      try {
        await createSupabaseAdminClient().storage.from(STORAGE_BUCKET).remove([contract.file_path])
      } catch {
        // Storage object may already be gone — proceed with the row delete.
      }
    }

    const { error } = await supabase.from('contracts').delete().eq('id', contract.id).eq('user_id', user.id)
    if (error) throw new AppError('DB_DELETE', 'Could not delete the contract.', 500)

    return new Response(null, { status: 204 })
  } catch (err) {
    return toErrorResponse(err)
  }
}
