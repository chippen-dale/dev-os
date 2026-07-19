import type { User } from '@supabase/supabase-js'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { unauthorized } from '@/lib/errors'

// Returns the signed-in user or null (for Server Components).
export async function getUser(): Promise<User | null> {
  const supabase = createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// Returns the user or throws AppError(401) (for Route Handlers).
export async function requireUser(): Promise<User> {
  const user = await getUser()
  if (!user) throw unauthorized()
  return user
}
