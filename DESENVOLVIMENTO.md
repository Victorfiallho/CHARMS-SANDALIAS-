# Guia de Desenvolvimento — Charms Sandálias

## Requisitos

- Node.js >= 18
- npm >= 9
- Conta Supabase (para o banco de dados)
- WhatsApp Business Account (para webhooks)
- Instagram Business Account (para webhooks)

## Setup Inicial

### 1. Clonar e instalar dependências

```bash
cd CharmsSandalias
npm install
```

### 2. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto (copiar de `.env.example`):

```bash
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=seu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=seu-service-role-key-aqui

# Redis (local por padrão)
REDIS_URL=redis://localhost:6379

# WhatsApp
WHATSAPP_TOKEN=seu-token-aqui
WHATSAPP_PHONE_NUMBER_ID=seu-numero-id-aqui

# Instagram
INSTAGRAM_ACCESS_TOKEN=seu-token-aqui
INSTAGRAM_APP_ID=seu-app-id
INSTAGRAM_APP_SECRET=seu-app-secret

# Outros
GROQ_API_KEY=sua-chave-groq
RESEND_API_KEY=sua-chave-resend
```

### 3. Inicializar banco de dados

No Supabase, copie e execute o SQL em `packages/db/src/schema.sql`:

```bash
# Abra o editor SQL do Supabase e rode:
# (conteúdo de packages/db/src/schema.sql)
```

## Rodar localmente

### Terminal 1 — Worker (webhooks + filas)

```bash
npm run dev:worker
```

Acesse: http://localhost:3001/health

### Terminal 2 — Web (painel Next.js)

```bash
npm run dev:web
```

Acesse: http://localhost:3000

## Testar webhooks

### WhatsApp

```bash
curl -X POST http://localhost:3001/webhook/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "changes": [{
        "value": {
          "contacts": [{"profile": {"name": "João Silva"}, "wa_id": "5511999999999"}],
          "messages": [{
            "id": "wamsg_123",
            "from": "5511999999999",
            "text": {"body": "Olá, quero conhecer as sandálias"},
            "timestamp": "'$(date +%s)'"
          }]
        }
      }]
    }]
  }'
```

### Instagram

```bash
curl -X POST http://localhost:3001/webhook/instagram \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "changes": [{
        "value": {
          "sender_id": "instagram_123",
          "message": {"text": "Oi, tudo bem?"},
          "received_timestamp": "'$(date +%s)'"
        }
      }]
    }]
  }'
```

## Estrutura de pastas

```
charmssandalias/
├── apps/
│   ├── web/          → Painel Next.js (port 3000)
│   └── worker/       → Fastify worker (port 3001)
├── packages/
│   ├── db/           → Cliente Supabase e schema
│   ├── types/        → Tipos compartilhados
│   └── integrations/ → Clientes de API externos
└── [outros arquivos de config]
```

## Comandos úteis

```bash
# Compilar tudo
npm run build

# Lint de todos os workspaces
npm run lint

# Formatar código
npm run format

# Rodar worker em produção
npm --workspace @charms/worker run build
node apps/worker/dist/index.js

# Rodar web em produção
npm --workspace @charms/web run build
npm --workspace @charms/web run start
```

## Deploy

### Worker — Railway

1. Crie um novo projeto no Railway
2. Conecte o repositório Git
3. Configure variáveis de ambiente
4. Deploy automático via git push

### Web — Vercel

1. Crie um novo projeto no Vercel
2. Conecte o repositório Git
3. Configure root directory: `apps/web`
4. Deploy automático via git push

## Troubleshooting

**"SUPABASE_URL and SUPABASE_ANON_KEY are required"**

Verifique que `.env.local` está criado e populado corretamente.

**Worker não conecta ao Supabase**

Confirme que a URL e as chaves estão corretas e que o projeto Supabase está ativo.

**Webhooks não chegam ao worker local**

Use ngrok para expor o servidor local:

```bash
ngrok http 3001
```

Depois configure o webhook no painel da Meta usando a URL do ngrok.
