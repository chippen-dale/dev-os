import type { ContractType } from '@/lib/types'

// Standard term libraries per contract type (engineering-doc §8.2). Client-safe data.
export const STANDARD_TERMS: Record<ContractType, string[]> = {
  nda: [
    'Parties',
    'Effective Date',
    'Confidentiality Obligations',
    'Permitted Disclosures',
    'Term & Duration',
    'Governing Law',
    'Jurisdiction',
    'IP Ownership',
    'Non-Solicitation',
    'Breach & Remedy',
  ],
  msa: [
    'Parties',
    'Service Scope',
    'Payment Terms',
    'Invoice Schedule',
    'Late Payment Penalty',
    'Liability Cap',
    'Indemnification',
    'IP Ownership',
    'Termination Clause',
    'Governing Law',
    'Dispute Resolution',
    'Notice Period',
  ],
}

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  nda: 'NDA',
  msa: 'MSA',
}
