-- Supabase schema inicial para o CRM omnichannel

-- Extensão necessária para a coluna embedding (Fase 2 — bot RAG)
-- No Supabase: Database → Extensions → procure "vector" e ative antes de rodar este SQL
create extension if not exists vector;

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  telefone text,
  instagram_id text,
  email text,
  origem text not null,
  status text not null,
  tags text[] not null default array[]::text[],
  created_at timestamptz not null default now(),
  last_seen_at timestamptz,
  constraint contacts_status_check check (status in ('novo', 'qualificado', 'negociacao', 'fechamento', 'pos-venda'))
);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references contacts(id) on delete cascade,
  canal text not null,
  started_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  meta jsonb default '{}'::jsonb
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references contacts(id) on delete cascade,
  conversation_id uuid references conversations(id) on delete set null,
  canal text not null,
  direction text not null,
  conteudo text not null,
  timestamp timestamptz not null default now(),
  external_id text not null,
  created_at timestamptz not null default now(),
  constraint messages_direction_check check (direction in ('inbound', 'outbound')),
  unique (external_id, canal)
);

create table if not exists pipeline_cards (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references contacts(id) on delete cascade,
  status text not null,
  value numeric(12,2),
  produto_interesse text,
  position int not null default 0,
  updated_at timestamptz not null default now(),
  constraint pipeline_status_check check (status in ('novo', 'qualificado', 'negociacao', 'fechamento', 'pos-venda'))
);

create table if not exists orders_mirror (
  id uuid primary key default gen_random_uuid(),
  bling_id text not null,
  contact_id uuid references contacts(id),
  total numeric(12,2) not null,
  status text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  meta jsonb default '{}'::jsonb,
  unique (bling_id)
);

create table if not exists stock_mirror (
  id uuid primary key default gen_random_uuid(),
  sku text not null,
  nome text not null,
  quantidade integer not null,
  updated_at timestamptz not null default now(),
  meta jsonb default '{}'::jsonb,
  unique (sku)
);

create table if not exists kb_chunks (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  chunk text not null,
  embedding vector(1536),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists followup_jobs (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references contacts(id) on delete cascade,
  canal text not null,
  scheduled_at timestamptz not null,
  trigger text not null,
  payload jsonb default '{}'::jsonb,
  status text not null default 'pending',
  attempts int not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint followup_status_check check (status in ('pending', 'processing', 'completed', 'failed'))
);
