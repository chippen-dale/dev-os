'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'
import { credentialsSchema } from '@/lib/validation/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type Mode = 'signin' | 'signup'

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isSignup = mode === 'signup'

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    setNotice(null)

    const parsed = credentialsSchema.safeParse({ email, password })
    if (!parsed.success) {
      const errs: { email?: string; password?: string } = {}
      for (const issue of parsed.error.issues) {
        errs[issue.path[0] as 'email' | 'password'] = issue.message
      }
      setFieldErrors(errs)
      return
    }
    setFieldErrors({})
    setLoading(true)

    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp(parsed.data)
        if (error) {
          setFormError(error.message)
          return
        }
        // Email confirmation ON → no session yet.
        if (!data.session) {
          setNotice('Check your email to confirm your account, then sign in.')
          return
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword(parsed.data)
        if (error) {
          setFormError('Email or password is incorrect.')
          return
        }
      }
      router.push('/dashboard')
      router.refresh()
    } catch {
      setFormError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-h3 font-semibold text-ink">
          {isSignup ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="text-body text-ink-secondary">
          {isSignup
            ? 'Start reviewing NDAs and MSAs in minutes.'
            : 'Sign in to review your contracts.'}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
          placeholder="you@company.com"
        />
        <Input
          label="Password"
          type="password"
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          placeholder="••••••••"
        />
      </div>

      {formError && (
        <div className="rounded-input border border-danger bg-danger-50 px-3 py-2 text-body text-danger-700">
          {formError}
        </div>
      )}
      {notice && (
        <div className="rounded-input border border-success-200 bg-success-50 px-3 py-2 text-body text-success-700">
          {notice}
        </div>
      )}

      <Button type="submit" loading={loading} className="w-full">
        {isSignup ? 'Get Started Free' : 'Sign In'}
      </Button>

      <p className="text-center text-body text-ink-secondary">
        {isSignup ? (
          <>
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-brand hover:text-brand-600">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New to ContractIQ?{' '}
            <Link href="/login?mode=signup" className="font-medium text-brand hover:text-brand-600">
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  )
}
