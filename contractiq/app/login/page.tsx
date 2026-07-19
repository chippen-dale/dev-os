import Link from 'next/link'
import { AuthForm } from '@/components/auth/AuthForm'
import { Card } from '@/components/ui/Card'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { mode?: string }
}) {
  const mode = searchParams?.mode === 'signup' ? 'signup' : 'signin'

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-25 px-6 py-16">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 block text-center text-h5 font-bold text-ink">
          Contract<span className="text-brand">IQ</span>
        </Link>
        <Card className="p-8">
          <AuthForm mode={mode} />
        </Card>
        <p className="mt-6 text-center text-caption text-gray-300">
          This is an AI-assisted review tool, not legal advice.
        </p>
      </div>
    </main>
  )
}
