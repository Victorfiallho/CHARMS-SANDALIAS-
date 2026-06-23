-- Habilita Realtime para a tabela contacts
-- Execute este SQL no Supabase SQL Editor (Database > SQL Editor)

-- Adiciona contacts ao publication do Realtime
alter publication supabase_realtime add table contacts;

-- Se RLS estiver ativo, permite leitura pela anon key (necessário para o Realtime)
-- create policy "anon select contacts" on contacts
--   for select to anon using (true);
