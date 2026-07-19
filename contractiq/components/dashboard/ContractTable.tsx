'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ContractStatus, ContractType } from '@/lib/types'
import { CONTRACT_TYPE_LABELS } from '@/lib/contract-terms'
import { StatusPill } from '@/components/contract/StatusPill'
import { DeleteContractButton } from './DeleteContractButton'
import { cn } from '@/lib/utils'

export interface ContractRow {
  id: string
  file_name: string
  contract_type: ContractType
  status: ContractStatus
  created_at: string
}

type SortKey = 'file_name' | 'contract_type' | 'created_at'

export function ContractTable({ initialRows }: { initialRows: ContractRow[] }) {
  const router = useRouter()
  const [rows, setRows] = useState(initialRows)
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [asc, setAsc] = useState(false)

  const sorted = useMemo(() => {
    const copy = [...rows]
    copy.sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return asc ? cmp : -cmp
    })
    return copy
  }, [rows, sortKey, asc])

  function toggleSort(key: SortKey) {
    if (key === sortKey) setAsc((v) => !v)
    else {
      setSortKey(key)
      setAsc(key === 'created_at' ? false : true)
    }
  }

  function caret(key: SortKey) {
    if (key !== sortKey) return null
    return <span className="ml-1 text-brand">{asc ? '▲' : '▼'}</span>
  }

  const header = (key: SortKey, label: string) => (
    <button
      type="button"
      onClick={() => toggleSort(key)}
      className="flex items-center text-caption font-medium uppercase tracking-normal text-ink-secondary hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      {label}
      {caret(key)}
    </button>
  )

  return (
    <div className="overflow-hidden rounded-card border border-gray-100 bg-white">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-50">
            <th className="px-4 py-3">{header('file_name', 'Contract')}</th>
            <th className="px-4 py-3">{header('contract_type', 'Type')}</th>
            <th className="px-4 py-3 text-caption font-medium uppercase text-ink-secondary">Status</th>
            <th className="px-4 py-3">{header('created_at', 'Uploaded')}</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => (
            <tr
              key={row.id}
              onClick={() => router.push(`/contract/${row.id}`)}
              className={cn(
                'cursor-pointer border-b border-gray-50 transition-colors duration-100 last:border-0 hover:bg-gray-25',
              )}
            >
              <td className="px-4 py-3 text-body font-medium text-ink">{row.file_name}</td>
              <td className="px-4 py-3 text-body text-ink-secondary">
                {CONTRACT_TYPE_LABELS[row.contract_type]}
              </td>
              <td className="px-4 py-3">
                <StatusPill status={row.status} />
              </td>
              <td className="px-4 py-3 text-body text-ink-secondary">
                {new Date(row.created_at).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                <DeleteContractButton
                  contractId={row.id}
                  fileName={row.file_name}
                  onDeleted={(id) => setRows((r) => r.filter((x) => x.id !== id))}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
