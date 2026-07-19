import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { ChatMessage, MessageRole, MessageSource } from '@/lib/types'

// The Memory Layer (Lesson 2): persistent (Supabase) + in-context (windowed) memory.
// Design rule: ALWAYS loadHistory() BEFORE saving the new user message, so the
// classifier and context window never include the message being answered.

// Get or create the single chat session for a contract.
export async function ensureSession(
  supabase: SupabaseClient,
  contractId: string,
  userId: string,
): Promise<string> {
  const { data: existing } = await supabase
    .from('chat_sessions')
    .select('id')
    .eq('contract_id', contractId)
    .maybeSingle()
  if (existing) return existing.id as string

  const { data: created, error } = await supabase
    .from('chat_sessions')
    .insert({ contract_id: contractId, user_id: userId })
    .select('id')
    .single()
  if (error || !created) throw error ?? new Error('Could not create chat session')
  return created.id as string
}

// Persistent memory — load the full conversation, ascending.
export async function loadHistory(supabase: SupabaseClient, sessionId: string): Promise<ChatMessage[]> {
  const { data } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .returns<ChatMessage[]>()
  return data ?? []
}

// In-context memory window (Lesson 2, step 2):
// history-only → last 20 messages; contract/both → last 10 messages.
export function windowHistory(history: ChatMessage[], classification: MessageSource): ChatMessage[] {
  const take = classification === 'history' ? 20 : 10
  return history.slice(-take)
}

export async function saveMessage(
  supabase: SupabaseClient,
  args: { sessionId: string; userId: string; role: MessageRole; content: string },
): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      session_id: args.sessionId,
      user_id: args.userId,
      role: args.role,
      content: args.content,
    })
    .select('*')
    .single<ChatMessage>()
  if (error || !data) throw error ?? new Error('Could not save message')
  return data
}
