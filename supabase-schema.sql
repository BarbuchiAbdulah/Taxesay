-- ============================================================
-- TaxEase — Supabase Database Setup
-- Run this in your Supabase project: Dashboard > SQL Editor
-- ============================================================

-- 1. User tax profiles (mirrors the onboarding form)
create table public.profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade unique not null,
  country       text,
  visa_type     text,
  tax_year      text,
  state         text,
  income_sources text[],
  updated_at    timestamptz default now()
);

-- 2. Document checklist progress
create table public.checklist_items (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade not null,
  document_name text not null,
  checked       boolean default false,
  updated_at    timestamptz default now(),
  unique(user_id, document_name)
);

-- 3. SpringTax prep answers (one JSON blob per user)
create table public.springtax_prep (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade unique not null,
  answers    jsonb default '{}',
  updated_at timestamptz default now()
);

-- 4. Uploaded document metadata (files stored in Supabase Storage)
create table public.documents (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  name         text not null,
  storage_path text not null,
  file_type    text,
  size_bytes   bigint,
  uploaded_at  timestamptz default now()
);

-- ============================================================
-- Row Level Security — users can only access their own rows
-- ============================================================

alter table public.profiles       enable row level security;
alter table public.checklist_items enable row level security;
alter table public.springtax_prep  enable row level security;
alter table public.documents       enable row level security;

-- profiles
create policy "profiles: owner access" on public.profiles
  for all using (auth.uid() = user_id);

-- checklist_items
create policy "checklist: owner access" on public.checklist_items
  for all using (auth.uid() = user_id);

-- springtax_prep
create policy "springtax_prep: owner access" on public.springtax_prep
  for all using (auth.uid() = user_id);

-- documents
create policy "documents: owner access" on public.documents
  for all using (auth.uid() = user_id);

-- ============================================================
-- Storage bucket
-- ============================================================
-- In Supabase Dashboard > Storage, create a bucket named:
--   tax-documents
-- Set it to PRIVATE (not public).
-- Then add this storage policy (Dashboard > Storage > Policies):

-- Allow users to manage only their own files (path starts with their user ID):
-- INSERT / SELECT / DELETE where (storage.foldername(name))[1] = auth.uid()::text
