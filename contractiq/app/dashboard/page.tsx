import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/getUser'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { SignOutButton } from '@/components/auth/SignOutButton'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { ContractTable, type ContractRow } from '@/components/dashboard/ContractTable'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default async function DashboardPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const supabase = createSupabaseServerClient()
  const { data } = await supabase
    .from('contracts')
    .select('id, file_name, contract_type, status, created_at')
    .order('created_at', { ascending: false })
    .returns<ContractRow[]>()

  const contracts = data ?? []
  const totals = {
    all: contracts.length,
    nda: contracts.filter((c) => c.contract_type === 'nda').length,
    msa: contracts.filter((c) => c.contract_type === 'msa').length,
  }

  return (
    <main className="min-h-screen bg-gray-25">
      <header className="flex items-center justify-between border-b border-gray-50 px-8 py-5">
        <span className="text-h5 font-bold text-ink">
          Contract<span className="text-brand">IQ</span>
        </span>
        <div className="flex items-center gap-4">
          <span className="hidden text-body text-ink-secondary sm:inline">{user.email}</span>
          <SignOutButton />
        </div>
      </header>

      <section className="mx-auto flex max-w-5xl flex-col gap-8 px-8 py-12">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-h3 font-semibold text-ink">Dashboard</h1>
          <Link href="/review">
            <Button>Review a Contract</Button>
          </Link>
        </div>

        {contracts.length === 0 ? (
          <Card className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-body font-medium text-ink">No contracts reviewed yet</p>
            <p className="max-w-sm text-body text-ink-secondary">
              Upload your first NDA or MSA to extract its key terms in minutes.
            </p>
            <Link href="/review">
              <Button className="mt-2">Review a Contract</Button>
            </Link>
          </Card>
        ) : (
          <div className="flex flex-col gap-8">
            <SummaryCards totals={totals} />
            <div className="flex flex-col gap-3">
              <h2 className="text-h5 font-medium text-ink">History</h2>
              <ContractTable initialRows={contracts} />
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
