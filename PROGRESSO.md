# Progresso — Charms Sandálias (22/06/2026)

## ✅ Concluído

### Infraestrutura
- [x] Monorepo npm workspaces configurado
- [x] TypeScript estrito em todos os workspaces
- [x] Estrutura de pastas (`apps/web`, `apps/worker`, `packages/`)

### Backend (Worker)
- [x] Fastify + BullMQ + Redis pronto
- [x] Servidor HTTP ouvindo na porta 3001
- [x] Endpoint `/health` para health checks
- [x] Validação Zod em entrada (webhooks)
- [x] Webhooks `/webhook/whatsapp` e `/webhook/instagram`
- [x] Integração Supabase (cliente configurado)
- [x] Função `upsertContactWithIdentifiers()` (deduplicação)
- [x] Função `insertMessage()` (com idempotência)
- [x] Suporte a dotenv para dev local

### Frontend (Web)
- [x] Next.js 14 configurado
- [x] Página inicial (`/`)
- [x] Layout com Tailwind setup pronto
- [x] Estrutura de componentes

### Banco de Dados
- [x] Schema SQL com 8 tabelas:
  - contacts
  - conversations
  - messages
  - pipeline_cards
  - orders_mirror
  - stock_mirror
  - kb_chunks
  - followup_jobs
- [x] Tipos compartilhados via `@charms/types`
- [x] Cliente Supabase com funções helpers

### Documentação
- [x] `SKILL.md` — Regras do projeto
- [x] `DESENVOLVIMENTO.md` — Como rodar localmente
- [x] `TESTE_RAPIDO.md` — Exemplos de curl para testar webhooks
- [x] `plano-acao-loja-sandalias.md` — Plano de fases

---

## 🔄 Em Progresso

- Sistema rodando em dev:
  - Worker: http://localhost:3001 ✅
  - Web: http://localhost:3000 ✅

---

## ⏭️ Próximos Passos (Fase 1)

### Backend melhorias
- [ ] Logger estruturado (pino)
- [ ] Redis integrado com BullMQ para filas
- [ ] Endpoint de envio de mensagem (`/send-message`)
- [ ] Testes unitários (Jest)

### Frontend
- [ ] Componente de Pipeline/Kanban (dnd-kit + React)
- [ ] Listagem de contatos com filtros
- [ ] Página de conversas
- [ ] Integração API com /health e endpoints futuros

### Banco
- [ ] Executar schema.sql no Supabase real
- [ ] Gerar tipos TypeScript automáticos (supabase-cli)
- [ ] Migrations versionadas

### Integrações
- [ ] Módulo WhatsApp Cloud API (envio + validação)
- [ ] Módulo Instagram Graph API
- [ ] Módulo Bling (sync estoque/pedidos)

---

## 💰 Custos atuais (dev)

| Item | Custo |
|------|-------|
| Railway (worker vazio) | ~R$30/mês |
| Vercel (web vazio) | R$0 (Hobby) |
| Supabase free tier | R$0 |
| **Total** | **~R$30/mês** |

Quando escalado com tráfego real: ~R$570-1.050/mês (incluindo Meta WhatsApp).

---

## 🚀 Deploy pronto para

- `npm run build` compila ambos os workspaces ✅
- Railway (git push do worker)
- Vercel (git push do web)

---

## 📝 Comandos úteis

```bash
# Dev
npm run dev:worker  # Terminal 1
npm run dev:web     # Terminal 2

# Build
npm run build

# Testar webhook (veja TESTE_RAPIDO.md)
curl -X POST http://localhost:3001/webhook/whatsapp ...
```

---

## 🎯 Prioridades para continuar

1. **Setup Supabase real** (essencial)
   - Criar projeto
   - Executar schema.sql
   - Preencher .env.local

2. **Bot prototipo** (próxima semana)
   - Groq Llama 3.3 70B
   - RAG simples com pgvector
   - Guardrails de segurança

3. **Painel Kanban** (próxima semana)
   - Drag-and-drop de cards entre colunas
   - Filtros por canal
   - Busca de contatos

4. **Deploy Railway + Vercel** (quando Phase 1 fechar)

---

Desenvolvido com ❤️ para Charms Sandálias
