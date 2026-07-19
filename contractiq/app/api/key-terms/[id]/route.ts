import type { NextRequest } from 'next/server'
import { requireUser } from '@/lib/auth/getUser'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { editKeyTermSchema } from '@/lib/validation/keyTerm'
import { AppError, toErrorResponse, notFound } from '@/lib/errors'
import type { KeyTerm } from '@/lib/types'

// PATCH /api/key-terms/[id] — inline edit; preserve the AI's original value on first edit.
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireUser()
    const { value } = editKeyTermSchema.parse(await req.json())
    const supabase = createSupabaseServerClient()

    const { data: term } = await supabase
      .from('key_terms')
      .select('id, value, is_edited')
      .eq('id', params.id)
      .single()
    if (!term) throw notFound('Key term')

    const update: Record<string, unknown> = { value, is_edited: true }
    if (!term.is_edited) update.original_value = term.value // capture the AI's original once

    const { data: updated, error } = await supabase
      .from('key_terms')
      .update(update)
      .eq('id', params.id)
      .select('*')
      .single<KeyTerm>()
    if (error || !updated) throw new AppError('DB_UPDATE', 'Could not save the change.', 500)

    return Response.json(updated)
  } catch (err) {
    return toErrorResponse(err)
  }
}
