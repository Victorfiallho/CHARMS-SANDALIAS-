-- Migration 001: tabela de produtos do catálogo Charms Sandálias
-- Execute no Supabase SQL Editor (Database → SQL Editor)

create table if not exists products (
  id          uuid        primary key default gen_random_uuid(),
  nome        text        not null,
  categoria   text        not null,
  cor         text        not null,
  cor_hex     text        not null default '#888888',
  preco       numeric(10,2) not null,
  preco_pix   numeric(10,2),
  numeracao   text        not null default '33-40',
  disponivel  boolean     not null default true,
  destaque    boolean     not null default false,
  sku         text        not null,
  created_at  timestamptz not null default now(),
  unique(sku)
);
