-- Migration 002: adiciona coluna imagem_url à tabela products
-- Execute no Supabase SQL Editor

alter table products add column if not exists imagem_url text;
