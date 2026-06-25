-- Migration 003: habilita Realtime para a tabela messages
-- Execute no Supabase SQL Editor (Database → SQL Editor)

alter publication supabase_realtime add table messages;
