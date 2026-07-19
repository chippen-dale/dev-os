import { z } from 'zod'

export const credentialsSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
})

export type Credentials = z.infer<typeof credentialsSchema>
