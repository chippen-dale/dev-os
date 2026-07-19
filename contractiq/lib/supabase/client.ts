import { createBrowserClient } from '@supabase/ssr'

// Browser client — used by Client Components for auth + RLS-scoped reads.
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
