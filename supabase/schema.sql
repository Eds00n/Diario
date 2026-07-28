-- Nosso Diário — schema MVP
-- Rode no SQL Editor do Supabase (Dashboard → SQL → New query).

-- Entradas da timeline
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  texto text not null default '',
  fotos text[] not null default '{}',
  is_data_especial boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists entries_data_idx on public.entries (data desc);

-- Datas especiais
create table if not exists public.special_dates (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  data date not null,
  recorrente boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.entries enable row level security;
alter table public.special_dates enable row level security;

-- Leitura pública (timeline com anon key)
create policy "Public read entries"
  on public.entries for select
  to anon, authenticated
  using (true);

create policy "Public read special_dates"
  on public.special_dates for select
  to anon, authenticated
  using (true);

-- Escrita só autenticado (admin)
create policy "Authenticated write entries"
  on public.entries for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated write special_dates"
  on public.special_dates for all
  to authenticated
  using (true)
  with check (true);

-- Storage: crie o bucket "fotos" (Dashboard → Storage → New bucket)
-- Nome: fotos | Public bucket: ON
--
-- Políticas (Storage → fotos → Policies):
-- 1) SELECT: public (ou "Anyone can read")
-- 2) INSERT / UPDATE / DELETE: authenticated
