-- Ink Name · account history schema
-- Run this once against your Supabase project (SQL Editor, or `supabase db push`).
-- Identity itself is handled entirely by Supabase Auth (auth.users) — this
-- migration only adds the table that remembers each signed-in visitor's
-- generated names.

create table if not exists public.creations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  -- inputs
  english_name text not null,
  gender text not null,
  birth_date date not null,
  birth_time text,

  -- generated result (mirrors NameGenerationResult in name-generator.ts)
  chinese_name text not null,
  pinyin text not null,
  meaning text not null,
  cultural_explanation text not null,
  pronunciation_mapping text not null,
  element_analysis text not null,
  classical_allusion text,
  suggested_characters jsonb not null,

  -- filled in later, asynchronously, once each AI image finishes (nullable
  -- until then — the text result is saved immediately, art follows)
  calligraphy_image_data text,
  seal_image_data text,

  created_at timestamptz not null default now()
);

create index if not exists creations_user_id_created_at_idx
  on public.creations (user_id, created_at desc);

alter table public.creations enable row level security;

drop policy if exists "creations_select_own" on public.creations;
create policy "creations_select_own"
  on public.creations for select
  using (auth.uid() = user_id);

drop policy if exists "creations_insert_own" on public.creations;
create policy "creations_insert_own"
  on public.creations for insert
  with check (auth.uid() = user_id);

drop policy if exists "creations_update_own" on public.creations;
create policy "creations_update_own"
  on public.creations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "creations_delete_own" on public.creations;
create policy "creations_delete_own"
  on public.creations for delete
  using (auth.uid() = user_id);
