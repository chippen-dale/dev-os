import { z } from 'zod'
import { MAX_CUSTOM_TERMS } from '@/lib/constants'

export const contractTypeSchema = z.enum(['nda', 'msa'])

export const customTermsSchema = z
  .array(z.string().trim().min(1, 'Term cannot be empty.').max(80, 'Term is too long.'))
  .max(MAX_CUSTOM_TERMS, `At most ${MAX_CUSTOM_TERMS} custom terms.`)
