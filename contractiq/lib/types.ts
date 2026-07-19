// Shared domain types — mirror the DB schema in docs/specs/supabase-schema.sql.

export type ContractType = 'nda' | 'msa'
export type ContractStatus = 'uploaded' | 'processing' | 'complete' | 'error'
export type MessageRole = 'user' | 'assistant'
export type FeedbackRating = 'up' | 'down'

// Memory-layer context classification (Lesson 2).
export type MessageSource = 'contract' | 'history' | 'both'

export interface Contract {
  id: string
  user_id: string
  file_name: string
  contract_type: ContractType
  contract_text: string // includes [PAGE N] markers
  file_path: string | null // null if Storage upload failed
  page_count: number
  status: ContractStatus
  created_at: string
  updated_at: string
}

export interface KeyTerm {
  id: string
  contract_id: string
  user_id: string
  term_name: string
  value: string | null
  page_number: number | null
  confidence_score: number | null // 0.000–1.000
  source_sentence: string | null
  is_custom: boolean
  original_value: string | null
  is_edited: boolean
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  session_id: string
  user_id: string
  role: MessageRole
  content: string
  created_at: string
}

export interface Feedback {
  id: string
  contract_id: string
  user_id: string
  rating: FeedbackRating
  comment: string | null
  created_at: string
}
