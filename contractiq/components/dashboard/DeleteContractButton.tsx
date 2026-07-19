'use client'

import { useState } from 'react'

export function DeleteContractButton({
  contractId,
  fileName,
  onDeleted,
}: {
  contractId: string
  fileName: string
  onDeleted: (id: string) => void
}) {
  const [busy, setBusy] = useState(false)

  async function handleDelete() {
    if (!window.confirm(`Delete “${fileName}” and all of its data? This cannot be undone.`)) return
    setBusy(true)
    try {
      const res = await fetch(`/api/contracts/${contractId}`, { method: 'DELETE' })
      if (!res.ok && res.status !== 204) throw new Error('Delete failed')
      onDeleted(contractId)
    } catch {
      setBusy(false)
      window.alert('Could not delete the contract. Please try again.')
    }
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={handleDelete}
      className="text-caption font-medium text-danger-700 hover:text-danger disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
    >
      {busy ? 'Deleting…' : 'Delete'}
    </button>
  )
}
