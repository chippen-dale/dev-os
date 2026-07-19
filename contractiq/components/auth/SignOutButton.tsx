'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

export function SignOutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function signOut() {
    setLoading(true)
    const supabase = createSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <Button variant="ghost" loading={loading} onClick={signOut}>
      Sign out
    </Button>
  )
}
