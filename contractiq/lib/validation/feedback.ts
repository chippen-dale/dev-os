import { z } from 'zod'

export const feedbackSchema = z.object({
  rating: z.enum(['up', 'down']),
  comment: z.string().trim().max(1000, 'Comment is too long.').optional(),
})
