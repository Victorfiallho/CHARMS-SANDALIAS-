# Teste Rápido — Sistema ao Vivo

## Endpoints disponíveis

### Health Check
```bash
curl http://localhost:3001/health
```
Resposta esperada:
```json
{"status":"ok","ts":1782152246000}
```

---

## Testando Webhooks

### WhatsApp — Simular mensagem recebida
```bash
$payload = @{
  entry = @(
    @{
      changes = @(
        @{
          value = @{
            contacts = @(@{
              profile = @{name = "João Silva"}
              wa_id = "5511999999999"
            })
            messages = @(@{
              id = "wamsg_$(Get-Random)"
              from = "5511999999999"
              text = @{body = "Oi, quero conhecer as sandálias"}
              timestamp = "$(([int][double]::Parse((Get-Date -UFormat %s))))"
            })
          }
        }
      )
    }
  )
} | ConvertTo-Json -Depth 10

$payload | curl -X POST http://localhost:3001/webhook/whatsapp `
  -H "Content-Type: application/json" `
  -d @-
```

### Instagram — Simular DM recebida
```bash
$payload = @{
  entry = @(
    @{
      changes = @(
        @{
          value = @{
            sender_id = "instagram_123_$(Get-Random)"
            message = @{text = "Oi, tudo bem?"}
            received_timestamp = "$(([int][double]::Parse((Get-Date -UFormat %s))))"
          }
        }
      )
    }
  )
} | ConvertTo-Json -Depth 10

$payload | curl -X POST http://localhost:3001/webhook/instagram `
  -H "Content-Type: application/json" `
  -d @-
```

---

## Painel Web

Acesse: **http://localhost:3000**

Você verá:
- Página inicial com link para Dashboard
- Estrutura básica pronta para integração com Supabase

---

## O que está faltando para produção

1. **Credenciais Supabase reais** no `.env.local`
   - Criar projeto em https://supabase.com
   - Copiar URL e chaves
   - Executar o schema SQL em `packages/db/src/schema.sql`

2. **Redis** (opcional para dev local, obrigatório para produção)
   - Dev local: use Redis local ou omita para mockar

3. **Credenciais Meta** (WhatsApp + Instagram)
   - WhatsApp Cloud API token
   - Instagram Graph API token

---

## Próximos passos

Depois de testar:
1. Criar conta Supabase real
2. Configurar webhooks no painel da Meta
3. Testar fluxo completo: mensagem → webhook → Supabase → painel
4. Implementar painel Kanban
5. Implementar bot de IA (Groq)
6. Deploy em Railway (worker) + Vercel (web)
