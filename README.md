# Charms Sandálias

Monorepo de automação omnichannel para loja de sandálias.

## Estrutura

- `apps/web` — painel Next.js
- `apps/worker` — Fastify + BullMQ + Redis
- `packages/db` — schemas e cliente Supabase
- `packages/types` — tipos de domínio compartilhados
- `packages/integrations` — clientes de API externos

## Comandos

- `npm install` — instala dependências
- `npm run dev:web` — inicia o painel Next.js
- `npm run dev:worker` — inicia o worker Fastify
- `npm run build` — compila todos os workspaces
