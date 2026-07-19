import { z } from 'zod'

export const chatSchema = z.object({
  message: z.string().trim().min(1, 'Message cannot be empty.').max(2000, 'Message is too long.'),
})
