import type { NextRequest } from 'next/server'
import { requireUser } from '@/lib/auth/getUser'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { extractPdfText, estimateTokens } from '@/lib/pdf/extract'
import { contractTypeSchema, customTermsSchema } from '@/lib/validation/contract'
import { LIMITS, STORAGE_BUCKET } from '@/lib/env'
import { AppError, toErrorResponse, validation, payloadTooLarge, contractTooLong } from '@/lib/errors'

export const runtime = 'nodejs'
export const maxDuration = 60

// POST /api/contracts — upload a PDF, extract text (with [PAGE N]), create the contract row.
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser()
    const form = await req.formData()

    const file = form.get('file')
    const contractType = contractTypeSchema.parse(form.get('contract_type'))
    const rawCustom = form.get('custom_terms')
    const customTerms = rawCustom ? customTermsSchema.parse(JSON.parse(String(rawCustom))) : []

    if (!(file instanceof File)) throw validation({ file: 'A PDF file is required.' })
    if (file.type !== 'application/pdf') throw validation({ file: 'File must be a PDF.' })
    if (file.size > LIMITS.maxUploadBytes) {
      throw payloadTooLarge(`File exceeds the ${LIMITS.maxUploadBytes / 1024 / 1024} MB limit.`)
    }

    const bytes = new Uint8Array(await file.arrayBuffer())

    // Extract once — this is the source of truth for AI + chat. Throws on scanned PDFs.
    const { text, pageCount } = await extractPdfText(bytes)
    if (pageCount > LIMITS.maxPages) {
      throw contractTooLong(`Contract has ${pageCount} pages; the limit is ${LIMITS.maxPages}.`)
    }
    if (estimateTokens(text) > LIMITS.maxContractTokens) {
      throw contractTooLong(`Contract is too long; the limit is ${LIMITS.maxContractTokens} tokens (~20 pages).`)
    }

    const supabase = createSupabaseServerClient()
    const { data: inserted, error: insertError } = await supabase
      .from('contracts')
      .insert({
        user_id: user.id,
        file_name: file.name,
        contract_type: contractType,
        contract_text: text,
        page_count: pageCount,
        status: 'uploaded',
      })
      .select('id')
      .single()

    if (insertError || !inserted) throw new AppError('DB_INSERT', 'Could not save the contract.', 500)
    const contractId = inserted.id as string

    // Non-blocking Storage upload. Failure only hides the PDF viewer later.
    let viewerAvailable = false
    try {
      const admin = createSupabaseAdminClient()
      const path = `${user.id}/${contractId}/${file.name}`
      const { error: uploadError } = await admin.storage
        .from(STORAGE_BUCKET)
        .upload(path, bytes, { contentType: 'application/pdf', upsert: true })
      if (!uploadError) {
        viewerAvailable = true
        await supabase.from('contracts').update({ file_path: path }).eq('id', contractId)
      }
    } catch {
      // Non-blocking: leave file_path null; text-viewer fallback will be used.
    }

    if (customTerms.length) {
      await supabase.from('custom_key_terms').insert(
        customTerms.map((term_name) => ({
          contract_id: contractId,
          user_id: user.id,
          term_name,
          is_manual: true,
        })),
      )
    }

    return Response.json(
      { contract_id: contractId, status: 'uploaded', page_count: pageCount, viewer_available: viewerAvailable },
      { status: 201 },
    )
  } catch (err) {
    return toErrorResponse(err)
  }
}

const SORT_COLUMNS = new Set(['created_at', 'file_name', 'contract_type'])

// GET /api/contracts — dashboard list + summary totals (RLS-scoped to the user).
export async function GET(req: NextRequest) {
  try {
    await requireUser()
    const supabase = createSupabaseServerClient()

    const url = new URL(req.url)
    const sortParam = url.searchParams.get('sort') ?? 'created_at'
    const sort = SORT_COLUMNS.has(sortParam) ? sortParam : 'created_at'
    const ascending = url.searchParams.get('order') === 'asc'

    const { data: contracts } = await supabase
      .from('contracts')
      .select('id, file_name, contract_type, status, created_at')
      .order(sort, { ascending })

    const rows = contracts ?? []
    const totals = {
      all: rows.length,
      nda: rows.filter((c) => c.contract_type === 'nda').length,
      msa: rows.filter((c) => c.contract_type === 'msa').length,
    }

    return Response.json({ totals, contracts: rows })
  } catch (err) {
    return toErrorResponse(err)
  }
}
