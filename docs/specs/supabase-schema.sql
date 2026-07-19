-- =====================================================================
-- ContractIQ — Supabase Schema (paste-and-run)
-- Target: fresh Supabase project → SQL Editor → paste this whole file → Run.
-- Idempotent: safe to re-run (guards on enums, DROP POLICY IF EXISTS, IF NOT EXISTS).
-- Source of truth: docs/engineering/engineering-doc.md §7.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------
create extension if not exists pgcrypto;      -- gen_random_uuid()

-- ---------------------------------------------------------------------
-- 1. Enums
-- ---------------------------------------------------------------------
do $$ begin
  create type contract_type   as enum ('nda', 'msa');
exception when duplicate_object then null; end $$;

do $$ begin
  create type contract_status as enum ('uploaded', 'processing', 'complete', 'error');
exception when duplicate_object then null; end $$;

do $$ begin
  create type message_role    as enum ('user', 'assistant');
exception when duplicate_object then null; end $$;

do $$ begin
  create type feedback_rating as enum ('up', 'down');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------
-- 2. updated_at trigger function
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 3. Tables (dependency order)
-- ---------------------------------------------------------------------

-- 3.1 contracts — one row per uploaded contract; canonical extracted text.
create table if not exists public.contracts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  file_name     text not null,
  contract_type contract_type not null,
  contract_text text not null,                       -- full text with [PAGE N] markers
  file_path     text,                                -- nullable: null if Storage upload failed
  page_count    int  not null check (page_count between 1 and 20),
  status        contract_status not null default 'uploaded',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_contracts_user            on public.contracts (user_id);
create index if not exists idx_contracts_user_created    on public.contracts (user_id, created_at desc);
create index if not exists idx_contracts_status          on public.contracts (status);

drop trigger if exists trg_contracts_updated_at on public.contracts;
create trigger trg_contracts_updated_at
  before update on public.contracts
  for each row execute function public.set_updated_at();

-- 3.2 key_terms — one row per extracted term (standard or custom) + correction history.
create table if not exists public.key_terms (
  id               uuid primary key default gen_random_uuid(),
  contract_id      uuid not null references public.contracts (id) on delete cascade,
  user_id          uuid not null references auth.users (id) on delete cascade,
  term_name        text not null,
  value            text,
  page_number      int  check (page_number >= 1),
  confidence_score numeric(4,3) check (confidence_score between 0 and 1),
  source_sentence  text,
  is_custom        boolean not null default false,
  original_value   text,                             -- AI's original value, preserved on first edit
  is_edited        boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_key_terms_contract on public.key_terms (contract_id);
create index if not exists idx_key_terms_user     on public.key_terms (user_id);

drop trigger if exists trg_key_terms_updated_at on public.key_terms;
create trigger trg_key_terms_updated_at
  before update on public.key_terms
  for each row execute function public.set_updated_at();

-- 3.3 custom_key_terms — user-defined terms (max 5) captured at the preview step.
create table if not exists public.custom_key_terms (
  id          uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  term_name   text not null,
  is_manual   boolean not null default true,
  created_at  timestamptz not null default now()
);

create index if not exists idx_custom_terms_contract on public.custom_key_terms (contract_id);

-- Enforce max 5 custom terms per contract.
create or replace function public.enforce_max_custom_terms()
returns trigger
language plpgsql
as $$
begin
  if (select count(*) from public.custom_key_terms where contract_id = new.contract_id) >= 5 then
    raise exception 'A contract may have at most 5 custom key terms';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_max_custom_terms on public.custom_key_terms;
create trigger trg_max_custom_terms
  before insert on public.custom_key_terms
  for each row execute function public.enforce_max_custom_terms();

-- 3.4 chat_sessions — one chat thread per contract (MVP: single session).
create table if not exists public.chat_sessions (
  id          uuid primary key default gen_random_uuid(),
  contract_id uuid not null unique references public.contracts (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  created_at  timestamptz not null default now()
);

create index if not exists idx_chat_sessions_user on public.chat_sessions (user_id);

-- 3.5 chat_messages — full conversation log (ascending, up to 200/turn).
create table if not exists public.chat_messages (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       message_role not null,
  content    text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_chat_messages_session on public.chat_messages (session_id, created_at asc);
create index if not exists idx_chat_messages_user    on public.chat_messages (user_id);

-- 3.6 user_feedback — thumbs + optional comment per review.
create table if not exists public.user_feedback (
  id          uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts (id) on delete cascade,
  user_id     uuid not null references auth.users (id) on delete cascade,
  rating      feedback_rating not null,
  comment     text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_feedback_contract on public.user_feedback (contract_id);
create index if not exists idx_feedback_user     on public.user_feedback (user_id);

-- ---------------------------------------------------------------------
-- 4. Row Level Security — enable + owner-only policies (user_id = auth.uid())
-- ---------------------------------------------------------------------
alter table public.contracts        enable row level security;
alter table public.key_terms        enable row level security;
alter table public.custom_key_terms enable row level security;
alter table public.chat_sessions    enable row level security;
alter table public.chat_messages    enable row level security;
alter table public.user_feedback    enable row level security;

-- contracts
drop policy if exists "contracts_select" on public.contracts;
create policy "contracts_select" on public.contracts for select using (auth.uid() = user_id);
drop policy if exists "contracts_insert" on public.contracts;
create policy "contracts_insert" on public.contracts for insert with check (auth.uid() = user_id);
drop policy if exists "contracts_update" on public.contracts;
create policy "contracts_update" on public.contracts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "contracts_delete" on public.contracts;
create policy "contracts_delete" on public.contracts for delete using (auth.uid() = user_id);

-- key_terms
drop policy if exists "key_terms_select" on public.key_terms;
create policy "key_terms_select" on public.key_terms for select using (auth.uid() = user_id);
drop policy if exists "key_terms_insert" on public.key_terms;
create policy "key_terms_insert" on public.key_terms for insert with check (auth.uid() = user_id);
drop policy if exists "key_terms_update" on public.key_terms;
create policy "key_terms_update" on public.key_terms for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "key_terms_delete" on public.key_terms;
create policy "key_terms_delete" on public.key_terms for delete using (auth.uid() = user_id);

-- custom_key_terms
drop policy if exists "custom_terms_select" on public.custom_key_terms;
create policy "custom_terms_select" on public.custom_key_terms for select using (auth.uid() = user_id);
drop policy if exists "custom_terms_insert" on public.custom_key_terms;
create policy "custom_terms_insert" on public.custom_key_terms for insert with check (auth.uid() = user_id);
drop policy if exists "custom_terms_delete" on public.custom_key_terms;
create policy "custom_terms_delete" on public.custom_key_terms for delete using (auth.uid() = user_id);

-- chat_sessions
drop policy if exists "chat_sessions_select" on public.chat_sessions;
create policy "chat_sessions_select" on public.chat_sessions for select using (auth.uid() = user_id);
drop policy if exists "chat_sessions_insert" on public.chat_sessions;
create policy "chat_sessions_insert" on public.chat_sessions for insert with check (auth.uid() = user_id);
drop policy if exists "chat_sessions_delete" on public.chat_sessions;
create policy "chat_sessions_delete" on public.chat_sessions for delete using (auth.uid() = user_id);

-- chat_messages
drop policy if exists "chat_messages_select" on public.chat_messages;
create policy "chat_messages_select" on public.chat_messages for select using (auth.uid() = user_id);
drop policy if exists "chat_messages_insert" on public.chat_messages;
create policy "chat_messages_insert" on public.chat_messages for insert with check (auth.uid() = user_id);
drop policy if exists "chat_messages_delete" on public.chat_messages;
create policy "chat_messages_delete" on public.chat_messages for delete using (auth.uid() = user_id);

-- user_feedback
drop policy if exists "feedback_select" on public.user_feedback;
create policy "feedback_select" on public.user_feedback for select using (auth.uid() = user_id);
drop policy if exists "feedback_insert" on public.user_feedback;
create policy "feedback_insert" on public.user_feedback for insert with check (auth.uid() = user_id);
drop policy if exists "feedback_delete" on public.user_feedback;
create policy "feedback_delete" on public.user_feedback for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 5. Storage — private 'contracts' bucket + owner-only object policies
--    Path pattern: contracts/{user_id}/{contract_id}/{filename}.pdf
--    Owner check:  auth.uid()::text = (storage.foldername(name))[1]
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('contracts', 'contracts', false)
on conflict (id) do nothing;

drop policy if exists "contracts_storage_insert" on storage.objects;
create policy "contracts_storage_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'contracts' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "contracts_storage_select" on storage.objects;
create policy "contracts_storage_select" on storage.objects
  for select to authenticated
  using (bucket_id = 'contracts' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "contracts_storage_delete" on storage.objects;
create policy "contracts_storage_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'contracts' and auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================================
-- End of schema. After running: verify 6 tables under Table Editor,
-- RLS = ON for each, and a private 'contracts' bucket under Storage.
-- =====================================================================
