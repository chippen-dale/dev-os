import { z } from 'zod'

export const editKeyTermSchema = z.object({
  value: z.string().trim().min(1, 'Value cannot be empty.').max(2000, 'Value is too long.'),
})
