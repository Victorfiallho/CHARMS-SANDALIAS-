# Plano de Ação Técnico — Ecossistema de Automação | Loja de Sândalias Online

> **Cliente:** Loja de sândalias online (omnichannel: Instagram + WhatsApp)
> **Executor:** AoTomate Sistemas
> **ERP/fonte da verdade:** Bling (estoque, pedidos, NF-e — já contratado pela cliente)
> **Situação atual:** Kommo manual, ~7.500 leads, tráfego pago ativo, ~R$600/mês em ferramentas desconectadas, sem visão de custo.
> **Modelo de entrega:** faseado, escopo travado por fase.

---

## 1. Stack definitiva (em código — sem N8N)

| Camada | Tecnologia | Por quê |
|---|---|---|
| **Orquestração / workers** | Node + **Fastify** + **BullMQ** + **Redis** | substitui o N8N: cada job é função testável, versionada no git, com retry e dead-letter de fábrica |
| **Front / painel** | **Next.js + React** + Recharts | terreno conhecido; tipos compartilhados com o backend |
| **Banco** | **Supabase** (Postgres + Auth + pgvector) | mantido; resolve auth + dados + busca vetorial do bot |
| **LLM** | **Groq — Llama 3.3 70B** | mantido; rápido e barato |
| **WhatsApp** | **Cloud API oficial (Meta)** | NÃO Evolution — canal de vendas não pode arriscar ban |
| **Instagram** | **Graph API (Messenger Platform)** | DM + interações |
| **ERP / NF / estoque** | **Bling via API** | não construímos isso do zero; orquestramos |
| **Email (follow-up)** | **Resend** | 3.000 emails/mês grátis |
| **Hospedagem app+workers** | **Railway** | git push, sobe API + workers + Redis, ~zero sysadmin |
| **Hospedagem front** | **Vercel** | Next nativo, Hobby grátis |

### Princípio arquitetural nº 1 — separar os dois deploys
- **App web (painel)** → Vercel (Next).
- **Serviço de workers/webhooks** → Railway (Fastify + BullMQ + Redis).
- Nunca misturar os dois. Webhook e follow-up agendado morrem em cold start de serverless — por isso os workers ficam num processo Node sempre-ligado no Railway.

### Princípio arquitetural nº 2 — Bling é a fonte da verdade
Estoque, pedidos e NF vivem no Bling. A AoTomate é a camada de inteligência e atendimento por cima. Não duplicamos lógica fiscal nem de estoque — sincronizamos via API/webhook.

```
Instagram DM ─┐
WhatsApp ─────┼─► Fastify (webhooks) ─► BullMQ (filas) ─► Supabase (CRM)
Tráfego pago ─┘          │                    │                  │
                         ▼                    ▼                  ▼
                   Bot IA (Groq)        Workers de        Painel Next
                  qualificação +        follow-up         (CRM/Kanban/BI)
                  RAG (pgvector)            │
                         │                  │
                         ▼                  ▼
              Escalonamento → humano    Email / WPP / Insta
                         │
                         ▼
              ┌──────────────────────┐
              │  BLING (API)         │
              │ Estoque·Pedido·NF-e  │
              └──────────────────────┘
```

---

## 2. Modelo de banco (Supabase) — núcleo

Tabelas centrais a criar:

- `contacts` — lead único, deduplicado entre canais. Campos: id, nome, telefone, instagram_id, email, origem (canal + campanha de tráfego), status, tags, created_at.
- `conversations` — histórico por contato e canal.
- `messages` — cada mensagem (direção, conteúdo, canal, timestamp da janela de 24h).
- `pipeline_cards` — estágio no funil, valor potencial, produto de interesse, posição no Kanban.
- `orders_mirror` — espelho de pedidos do Bling (read-only sync).
- `stock_mirror` — espelho de estoque do Bling.
- `kb_chunks` — base de conhecimento do bot com embeddings (pgvector) pro RAG.
- `followup_jobs` — fila lógica de follow-up (qual lead, qual canal, quando, qual gatilho).

---

## 3. Fases de entrega (escopo travado)

### FASE 1 — CRM Omnichannel + Pipeline + Kanban (essencial)
**Entrega:** mensagens de Insta e WhatsApp entram, viram contatos únicos, organizadas num pipeline visual com Kanban. Humano responde pelo painel. SEM bot de IA ainda.

Inclui:
- Fundação: monorepo, schema Supabase, auth, deploy Railway + Vercel.
- Integração WhatsApp Cloud API (webhook recebe + envia).
- Integração Instagram Graph API (DM recebe + envia).
- Deduplicação de contato entre canais.
- Pipeline: Novo → Qualificado → Negociação → Fechamento → Pós-venda.
- Kanban drag-and-drop no painel.
- Migração dos 7.500 leads do Kommo (import + normalização básica).

**Esforço estimado:** ~70–90h.

### FASE 2 — Bot de qualificação humanizado
**Entrega:** bot atende nos dois canais, qualifica, consulta estoque (Bling) antes de prometer, escala pro humano nos momentos-chave.

Inclui:
- Integração Groq (Llama 3.3 70B) + persona da marca.
- RAG: catálogo + FAQ + políticas em `kb_chunks` (pgvector) → respostas ancoradas no que a loja vende.
- Guardrails (o que o bot NUNCA faz).
- Escalonamento pro humano com contexto resumido.
- Consulta de estoque em tempo real via Bling antes de prometer produto.

**Esforço estimado:** ~50–70h.

### FASE 3 — BI + Gestão Financeira
**Entrega:** visão que ela nunca teve — CAC por campanha, funil por canal, fluxo de caixa.

Inclui:
- Dashboard: leads (entrou/saiu/converteu), por canal e campanha.
- **CAC por campanha** (cruzando custo de tráfego com vendas do Bling).
- Funil de conversão, ticket médio, produtos mais vendidos.
- Financeiro: entradas (vendas via Bling) e saídas (tráfego, fornecedores) → fluxo de caixa + DRE simplificado.

**Esforço estimado:** ~60–80h.

> **Regra de ouro do faseamento:** cada fase tem escopo travado em contrato. Nada entra no meio sem reorçar. (Anti-overpromising.)

---

## 4. Como treinar o bot (Fase 2) — RAG, não fine-tuning

1. **Base de conhecimento** → catálogo (Bling), FAQ, políticas (troca/frete/prazo), tom de voz.
2. **Embeddings + busca semântica** no `kb_chunks` (pgvector) → bot responde com base no que a loja realmente vende.
3. **Few-shot:** 20–30 conversas reais boas do Kommo como exemplo de atendimento.
4. **Guardrails:** nunca prometer desconto não autorizado, prazo sem checar, ou falar fora da loja.
5. **Loop de melhoria:** conversas escalonadas viram novos exemplos → bot melhora sem retreino caro.

---

## 5. Estratégia de follow-up barato/grátis

**Regra que governa tudo:** quem inicia conversa paga; quem responde dentro da janela de 24h não paga. O follow-up barato é uma **regra de decisão no código**, não uma ferramenta de disparo em massa.

### Hierarquia de canal (do grátis ao pago)

1. **Janela de 24h (WhatsApp) — R$0.** Toda resposta do lead abre 24h de mensagens grátis. O bot é desenhado pra *provocar resposta* (termina com pergunta) → conduz a venda inteira dentro da janela sem custo.
2. **Instagram DM — R$0.** Resposta a quem interagiu (comentou, story, DM) é grátis na Graph API. Leads de origem Insta seguem por aqui.
3. **Email (Resend) — ~R$0.** 3.000 emails/mês grátis. Cavalo de batalha pra reaquecer base fria, carrinho abandonado, novidades. Captura email no fluxo do bot.
4. **Template WhatsApp pago — bisturi, não espingarda.** ~R$0,30–0,40 por disparo (categoria marketing). Usado SÓ no segmento quente que o BI valida. Um bom template gera resposta → abre janela de 24h grátis → venda conduzida de graça depois.

### Lógica de segmentação (worker BullMQ)

```
Lead sem resposta há X dias
        │
        ▼
  Worker checa canal de origem + status no CRM
        │
   ┌────┴──────┬───────────────┬──────────────────┐
   ▼           ▼               ▼                  ▼
Origem      Tem email?     Está QUENTE?       Frio e sem
Instagram?  → Resend       (mexeu no funil,   email?
→ DM grátis   (~R$0)        pediu preço,       → não dispara
                            abandonou venda)     (não queima $)
                          → template WPP pago
                            no alvo (~R$0,35)
```

**Princípio:** disparo pago é decisão do BI, nunca automática em massa. O worker só paga quando o lead vale o custo.

### Anti-spam (obrigatório)
- Respeitar janela de 24h da Meta.
- Opt-out funcional em todo canal.
- Não disparar template pra base fria inteira (queima dinheiro e reputação do número).

---

## 6. Base de custo em produção (o que sai do SEU bolso)

### Início / baixo volume
| Item | Custo/mês |
|---|---|
| Railway (workers + Redis) | US$ 5 (~R$ 30) |
| Vercel (front) | R$ 0 (Hobby) |
| Supabase | R$ 0 (free tier) |
| Groq (Llama 3.3 70B) | ~R$ 30–80 |
| WhatsApp Cloud API (Meta) | ~R$ 50–200* |
| Instagram Graph API | R$ 0 |
| Resend (email follow-up) | R$ 0 (até 3k/mês) |
| Bling | R$ 0 pra você (assinatura dela) |
| **Total seu** | **~R$ 110–310/mês** |

### Escalado (volume real de tráfego)
| Item | Custo/mês |
|---|---|
| Railway | ~R$ 120–180 |
| Vercel | R$ 0–120 |
| Supabase Pro | ~R$ 150 |
| Groq | ~R$ 100–200 |
| WhatsApp Meta | ~R$ 200–500* |
| Resend | ~R$ 0–110 |
| **Total seu** | **~R$ 570–1.050/mês** |

\* **WhatsApp Meta é o único custo volátil e o maior.** Depende de quantas conversas a empresa inicia (template = pago; resposta em 24h = grátis). **Recomendação:** tratar como pass-through (repassar à cliente) ou embutir na mensalidade com margem — não absorver sem teto.

**Degraus a vigiar:** Supabase free→Pro (US$25) quando passar de 500MB; Meta quando o follow-up pago escalar.

---

## 7. Fluxo de construção sugerido (ordem de implementação — Fase 1)

1. Monorepo + Supabase schema + auth + deploy vazio funcionando (Railway + Vercel).
2. Webhook WhatsApp Cloud API recebendo e gravando em `messages`.
3. Webhook Instagram Graph recebendo e gravando.
4. Deduplicação → `contacts` único por canal.
5. Envio de mensagem pelos dois canais a partir do painel.
6. Pipeline + Kanban no front (Next + dnd-kit + Recharts).
7. Migração dos 7.500 leads (script de import + normalização).
8. Testes de ponta a ponta + handoff.

---

## 8. Riscos e pontos de atenção

- **Instagram Graph API** é o maior risco de cronograma: exige conta business aprovada, processo de review, janela de mensagem. Validar acesso na semana 1, antes de qualquer código.
- **WhatsApp Cloud API** exige verificação de negócio da Meta. Iniciar cedo.
- **Bug `@lid` da Meta** (formato GUID quebra roteamento) — reaplicar correção já conhecida.
- **Bot "sem revelar que é bot"**: zona cinza no CDC. Mitigar com escalonamento rápido e nunca enganar sobre prazo/produto. Alinhar explicitamente com a cliente.
- **Migração de 7.500 leads**: dados sujos/duplicados. Fase 1 faz import + normalização básica; limpeza profunda é escopo extra se necessário.
- **Escopo travado por fase**: não aceitar adições no meio sem reorçar.

---

## 9. Decisões já travadas

- [x] Stack em código (Fastify + BullMQ + Redis), N8N abandonado.
- [x] Supabase mantido (Postgres + auth + pgvector).
- [x] WhatsApp oficial (Cloud API), não Evolution.
- [x] Bling como fonte da verdade (estoque/pedido/NF).
- [x] Railway (app+workers) + Vercel (front).
- [x] Entrega faseada, essencial = Fase 1 (CRM+Pipeline+Kanban, dois canais).
- [ ] Pendente: precificação final por fase (discutir separadamente).
- [ ] Pendente: oficial vs. pass-through do custo Meta.
