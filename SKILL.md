# SKILL.md — Charms Sandálias (Ecossistema de Automação)

> Documento de engenharia do projeto. **Leia antes de tocar em qualquer arquivo.**
> Codifica as regras que evitam erros já conhecidos. Se você for quebrar uma regra
> daqui, é porque tem um motivo forte e documentado — não por pressa.

---

## 0. O que é este projeto

Ecossistema de automação para uma loja de sândalias online (omnichannel: Instagram + WhatsApp).
Substitui um setup manual no Kommo + ferramentas desconectadas. **Bling é o ERP/fonte da verdade**
(estoque, pedidos, NF-e). Esta aplicação é a camada de inteligência e atendimento por cima dele.

**Stack:** npm workspaces (monorepo) · Next.js (painel) · Fastify + BullMQ + Redis (workers) ·
Supabase (Postgres + Auth + pgvector) · Groq Llama 3.3 70B · WhatsApp Cloud API · Instagram Graph API ·
Bling API · Resend (email) · Railway (workers) + Vercel (front).

**Decisão fundadora:** este projeto NÃO usa N8N. Toda orquestração é código testável e versionado.
Se você sentir vontade de "automatizar visualmente", pare — foi exatamente isso que falhou antes.

---

## 1. Estrutura do monorepo

```
charmssandalias/
├── apps/
│   ├── web/          → Next.js — painel (CRM, Kanban, BI). Deploy: Vercel.
│   └── worker/       → Fastify + BullMQ — webhooks, filas, follow-up. Deploy: Railway.
├── packages/
│   ├── db/           → schema, migrations, cliente Supabase, TIPOS GERADOS.
│   ├── types/        → tipos de domínio compartilhados (Contact, PipelineCard...).
│   └── integrations/ → clientes de API: bling, whatsapp, instagram, groq, resend.
├── package.json      → workspaces
└── .env.example
```

**Regra:** `apps/` são coisas que sobem (deploy). `packages/` são coisas que os apps importam.
Tipo de domínio NUNCA é redefinido dentro de um app — vem sempre de `packages/`.

---

## 2. As três guardas inegociáveis (isto mata ~70% dos bugs)

### 2.1 Zod em TODA borda externa
Tudo que entra de fora — webhook da Meta, resposta do Bling, saída do Groq, payload do front —
é validado com um schema Zod ANTES de tocar qualquer lógica ou banco.

```ts
// errado — confia no formato externo
const phone = body.entry[0].changes[0].value.contacts[0].wa_id;

// certo — valida na borda, falha claro e cedo
const parsed = WhatsAppWebhookSchema.safeParse(body);
if (!parsed.success) {
  logger.warn({ err: parsed.error }, "payload meta inválido");
  return reply.code(200).send(); // 200 pra Meta não reenviar, mas NÃO processa lixo
}
```

**Por quê:** a Meta muda formato de payload sem avisar. Foi assim que o bug do `@lid` apareceu.
Com Zod, mudança de formato vira erro claro no ponto exato — não dado corrompido se espalhando.

### 2.2 Tipos do Supabase são GERADOS, nunca escritos à mão
```bash
npx supabase gen types typescript --project-id <id> > packages/db/src/database.types.ts
```
Rode isso toda vez que mudar o schema. O tipo de uma tabela vem do banco, não da sua cabeça.
Schema e código nunca divergem. **Nunca** digite manualmente o shape de uma row.

### 2.3 Idempotência em TODO worker
Webhook da Meta chega duplicado (ela reenvia se não receber 200 rápido). Todo job precisa ser
seguro pra rodar 2x sem criar lead duplicado nem disparar follow-up em dobro.

```ts
// use um id externo estável como chave de deduplicação
await db.from("messages").upsert(
  { external_id: msg.id, ... },
  { onConflict: "external_id", ignoreDuplicates: true }
);
```
Toda mensagem/evento tem um `external_id` único da origem. Toda escrita crítica é upsert por ele.

---

## 3. Regras de integração

### WhatsApp (Cloud API oficial — NÃO Evolution)
- Responda o webhook com **200 em < 5s SEMPRE**, mesmo que o processamento real vá pra fila.
  Processar na request = timeout = Meta reenvia = duplicata.
- Recebeu → valida (Zod) → enfileira (BullMQ) → responde 200. O trabalho acontece no worker.
- **Janela de 24h:** mensagem livre só dentro de 24h da última resposta do cliente. Fora disso,
  só template aprovado (pago). Rastreie `last_inbound_at` por contato.
- Reaplique a correção do `@lid`: o campo de identificação pode vir como GUID `@lid`, não só `wa_id`.
  Normalize ambos pro mesmo `contact`.

### Instagram (Graph API)
- Exige conta business aprovada + review. **Valide acesso ANTES de escrever código** — é o maior
  risco de cronograma.
- DM grátis dentro da janela de mensagem do usuário. Mesma lógica de janela do WhatsApp.

### Bling (fonte da verdade)
- Nunca duplique estoque/pedido/NF localmente como master. `stock_mirror` e `orders_mirror` são
  ESPELHOS read-only, sincronizados via API/webhook do Bling.
- O bot consulta estoque no Bling (ou no espelho fresco) ANTES de prometer produto. Nunca promete às cegas.
- Pedido fechado → cria no Bling via API → Bling emite NF. Não reinventamos lógica fiscal.
- Respeite rate limit da API do Bling. Sync em fila com backoff, não em rajada.

### Groq (Llama 3.3 70B)
- Saída do LLM é texto não confiável — valide/sanitize antes de agir sobre ela.
- Se o bot precisa retornar dado estruturado (ex: intenção, produto), peça JSON e valide com Zod.
- Guardrails de conteúdo são código, não confiança no prompt: o bot NUNCA promete desconto não
  autorizado, prazo sem checar, ou fala fora do escopo da loja.

---

## 4. Regras do bot de IA (Fase 2)

- **RAG, não fine-tuning.** Conhecimento vive em `kb_chunks` (pgvector): catálogo, FAQ, políticas, tom.
- Bot desenhado pra **provocar resposta** (termina com pergunta) → mantém a janela de 24h aberta → grátis.
- **Escalonamento pro humano** em: fechamento de venda, reclamação, pergunta fora do escopo,
  ou baixa confiança. Sempre passa com um resumo do contexto.
- Persona da marca é configurável, não hardcoded espalhado pelo código.

---

## 5. Follow-up — regra de decisão, não disparo em massa

**Princípio:** quem inicia paga, quem responde na janela não paga. Disparo pago é decisão do BI,
NUNCA automático em massa. Hierarquia de canal (grátis → pago):

1. Janela 24h WhatsApp (R$0) → 2. Instagram DM (R$0) → 3. Email/Resend (~R$0) →
4. Template WhatsApp pago (~R$0,35), SÓ no segmento quente que o BI validar.

- **Nunca** dispare template pra base fria inteira. Queima dinheiro e a reputação do número.
- Opt-out funcional obrigatório em todo canal.
- O worker de follow-up checa canal de origem + status no CRM e escolhe o caminho mais barato possível.

---

## 6. Convenções de código

- **TypeScript estrito.** `strict: true`. Sem `any` — se precisou de `any`, modele melhor.
- **Erros nunca são engolidos.** Todo catch loga com contexto estruturado (pino). Falha silenciosa
  é o que te queimou no N8N — não repita.
- **Segredos só em env.** Nada de token no código. `.env.example` documenta as chaves sem valores.
- **Nomes em inglês no código, domínio em português** onde fizer sentido (status do pipeline pode ser pt).
- **Migrations versionadas.** Mudança de schema é arquivo de migration commitado, não clique no painel.
- Tabelas e colunas em `snake_case` (padrão Postgres). Tipos e variáveis em `camelCase`/`PascalCase`.

---

## 6.1 Observabilidade — todo serviço nasce com isto

Todo serviço (o `worker` e qualquer API futura) expõe três coisas desde o primeiro dia. Não é
enfeite: é como você sabe que o sistema está vivo antes do cliente reclamar.

### `/health` — endpoint de saúde (obrigatório)
Rota pública e leve que responde 200 quando o serviço está de pé. O **Railway usa isso** pra saber
se o worker subiu e pra reiniciar se cair. Sem ele, você só descobre que caiu quando a loja para de
receber mensagem.
```ts
app.get("/health", async () => ({ status: "ok", ts: Date.now() }));
```
Versão "profunda" (opcional): checa também se Supabase e Redis respondem. Útil, mas mantenha o
`/health` raso rápido — o Railway só quer saber se o processo está vivo, não esperar 3 dependências.

### `/metrics` — métricas básicas
Contadores do que importa: mensagens recebidas, jobs na fila, falhas, follow-ups disparados.
Começa simples (um JSON com contadores). Te dá visão de volume sem abrir o banco toda hora.

### Swagger / OpenAPI — documentação que não mente
Toda API exposta tem docs automáticas geradas do código (não escritas à mão num doc que envelhece).
No nosso stack TypeScript/Fastify: `@fastify/swagger` + `@fastify/swagger-ui` → docs em `/docs`.
- A doc nasce dos schemas das rotas → muda o código, muda a doc, sozinha.
- É como você, o Clayton ou um cliente técnico testa e entende a API sem adivinhar.
- Equivalente ao `/docs` que o FastAPI dá de graça no mundo Python.

> Origem: padrão observado num projeto FastAPI (Quotation AI Agent). O *conteúdo* daquele projeto não
> entra na Charms — só o padrão: API documentada + `/health` + `/metrics` em todo serviço.

---

## 7. Ordem de construção (Fase 1) — não pule etapas

1. Esqueleto do monorepo + deploy VAZIO funcionando (Railway + Vercel) — prove o `git push` antes de tudo.
   O worker já sobe com `/health` respondendo 200 (o Railway precisa disso pra healthcheck).
2. Schema no Supabase (rodar SQL) + gerar tipos.
3. Webhook WhatsApp recebendo → valida → grava em `messages`.
4. Webhook Instagram recebendo → grava.
5. Deduplicação → `contacts` único por canal (resolver `@lid` aqui).
6. Envio de mensagem pelos dois canais a partir do painel.
7. Pipeline + Kanban no front.
8. Migração dos 7.500 leads (import + normalização).
9. Testes ponta a ponta + handoff.

> Construa o esqueleto com deploy funcionando ANTES de qualquer integração. Descobrir que o deploy
> não fecha depois de 3 módulos prontos é o pesadelo a evitar.

---

## 8. Checklist antes de cada commit/deploy

- [ ] Toda entrada externa nova tem schema Zod?
- [ ] Mudei schema? Rodei `supabase gen types`?
- [ ] O worker novo é idempotente (seguro rodar 2x)?
- [ ] Webhook responde 200 rápido e processa na fila?
- [ ] Nenhum segredo hardcoded?
- [ ] Erros logados com contexto, não engolidos?
- [ ] O bot não promete nada sem checar o Bling?
- [ ] Serviço novo expõe `/health`? API nova tem docs Swagger atualizadas?

---

## 9. UI/UX — sistema de design

### Stack de UI
- **Tailwind CSS v4** em `apps/web`. Configuração via CSS, sem `tailwind.config.js`.
- **PostCSS** via `@tailwindcss/postcss` (arquivo: `apps/web/postcss.config.mjs`).

### Design tokens — a fonte da verdade visual
**Arquivo único:** `apps/web/app/globals.css` bloco `@theme`.

Toda cor, raio de borda e fonte do painel nasce dali. Para mudar a identidade visual:
1. Edite apenas o bloco `@theme` em `globals.css`.
2. Nunca coloque valores de cor ou fonte hardcoded nos componentes — use as variáveis `var(--color-*)`.
3. Tokens de status de pipeline: `--color-status-novo`, `--color-status-qualificado`, etc. Mudar ali muda em todo o Kanban.

```css
/* Exemplo: trocar a cor principal da marca */
@theme {
  --color-brand-500: oklch(0.62 0.22 30); /* muda de azul para coral */
}
```

### Regras de componente
- **Server Components** por padrão. Adicione `"use client"` só quando precisar de estado/eventos.
- **CSS classes** para estilos reutilizáveis (`.kanban-card`, `.badge`, etc.). `style={}` inline só para valores dinâmicos (ex: cor do status que vem do banco).
- **Nunca use `!important`**. Se precisou, o seletor está errado.
- Tailwind utility classes são bem-vindas para one-offs (ex: `mt-2 text-sm`). Para padrões que se repetem 3+ vezes → extrai para classe CSS.

### Estrutura de componentes
```
apps/web/app/
├── dashboard/
│   ├── components/       ← componentes específicos do dashboard
│   │   ├── KanbanBoard.tsx
│   │   └── ConversationView.tsx
│   └── ...
└── components/           ← componentes globais reutilizáveis (futuros)
    ├── Button.tsx
    ├── Badge.tsx
    └── ...
```

### Anti-padrões de UI (NÃO faça)
- ❌ Hardcodar `#3b82f6` em componente — use `var(--color-brand-500)` ou classe Tailwind.
- ❌ Criar arquivo CSS por componente sem necessidade — Tailwind + globals.css bastam.
- ❌ Instalar biblioteca de componentes inteira (MUI, Chakra) por um botão — use Tailwind.
- ❌ `style={{ color: 'red' }}` para estados de erro — crie uma classe `.text-error`.

---

## 10. Anti-padrões deste projeto (NÃO faça)

- ❌ Orquestração em fluxo visual (N8N) — toda lógica é código.
- ❌ Processar webhook na request HTTP — enfileira e responde 200.
- ❌ Confiar no formato de payload externo sem validar.
- ❌ Tipos de banco escritos à mão.
- ❌ Disparo de template pra base inteira.
- ❌ Bot prometendo produto/prazo sem consultar o Bling.
- ❌ Evolution API no canal de vendas (risco de ban).
- ❌ Estoque/NF master fora do Bling.
