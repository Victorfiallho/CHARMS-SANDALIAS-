/**
 * Seed de dados demo — Charms Sandálias
 *
 * Uso:
 *   npm run seed
 *   npm run seed -- --clean   (limpa dados demo antes de recriar)
 */

// dotenv ANTES de qualquer import que use process.env
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// Só importa depois que o env está carregado
import { createClient } from "@supabase/supabase-js";

const CLEAN = process.argv.includes("--clean");

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // service role ignora RLS

if (!url || !key) {
  console.error("❌  SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar no .env.local");
  process.exit(1);
}

// Cria client com service role (necessário para inserir sem políticas RLS)
const supabase = createClient(url, key, { auth: { persistSession: false } });

// ── Dados demo ────────────────────────────────────────────────────
const CONTACTS = [
  // NOVO
  {
    nome: "Ana Paula Lima", telefone: "5511987654321", origem: "whatsapp", status: "novo",
    tags: ["whatsapp", "tráfego-pago", "demo"],
    messages: [
      { direction: "inbound",  conteudo: "Oi! Vi o anúncio de vocês no Instagram. Têm sandália número 37?" },
      { direction: "outbound", conteudo: "Oi Ana Paula! Temos sim! Qual modelo te interessou? Posso te mandar as opções 😊" },
      { direction: "inbound",  conteudo: "A rasteirinha dourada que apareceu nos stories!" },
    ],
  },
  {
    nome: "Fernanda Costa", telefone: "5521999887766", origem: "whatsapp", status: "novo",
    tags: ["whatsapp", "demo"],
    messages: [
      { direction: "inbound",  conteudo: "Boa tarde! Vocês fazem entrega para o Rio?" },
      { direction: "outbound", conteudo: "Boa tarde, Fernanda! Sim, entregamos para todo o Brasil. Prazo para o RJ é de 2 a 4 dias úteis 📦" },
    ],
  },
  {
    nome: "Mariana Souza", instagramId: "mariana.souza.oficial", origem: "instagram", status: "novo",
    tags: ["instagram", "demo"],
    messages: [
      { direction: "inbound",  conteudo: "Amei esse modelo! Quanto custa?" },
      { direction: "outbound", conteudo: "Oii Mariana! Esse modelo está R$189,90. Frete grátis acima de R$250 💛" },
      { direction: "inbound",  conteudo: "Tem parcelamento?" },
    ],
  },
  // QUALIFICADO
  {
    nome: "Juliana Mendes", telefone: "5531988776655", origem: "whatsapp", status: "qualificado",
    tags: ["whatsapp", "interessada-kit", "demo"],
    messages: [
      { direction: "inbound",  conteudo: "Olá! Quero comprar 3 pares diferentes pra presentear. Tem algum desconto?" },
      { direction: "outbound", conteudo: "Oi Juliana! Para compras acima de R$500 temos 10% de desconto 🎁 Quais modelos te chamaram atenção?" },
      { direction: "inbound",  conteudo: "A rasteirinha, a tamanca anabela e a papete. Quanto sai os 3?" },
      { direction: "outbound", conteudo: "Os 3 juntos saem R$510,30 com desconto + frete grátis! Quer que eu monte o pedido?" },
      { direction: "inbound",  conteudo: "Preciso confirmar o número de uma delas. Te falo hoje à noite?" },
    ],
  },
  {
    nome: "Beatriz Rodrigues", instagramId: "bearodrigues__", origem: "instagram", status: "qualificado",
    tags: ["instagram", "influencer", "demo"],
    messages: [
      { direction: "inbound",  conteudo: "Oi! Sou influenciadora e adorei os produtos. Topam uma parceria?" },
      { direction: "outbound", conteudo: "Oi Beatriz! Que bacana! Pode me informar seu @ e número de seguidores?" },
      { direction: "inbound",  conteudo: "@bearodrigues__ com 45k seguidores, nicho de moda e lifestyle" },
    ],
  },
  // NEGOCIAÇÃO
  {
    nome: "Camila Ferreira", telefone: "5511944332211", origem: "whatsapp", status: "negociacao",
    tags: ["whatsapp", "atacado", "demo"],
    messages: [
      { direction: "inbound",  conteudo: "Tenho uma boutique em SP e quero comprar no atacado. Qual o mínimo?" },
      { direction: "outbound", conteudo: "Oi Camila! O mínimo é 12 pares por modelo. Posso te mandar nossa tabela de preços?" },
      { direction: "inbound",  conteudo: "Sim! E vocês trabalham com CNPJ?" },
      { direction: "outbound", conteudo: "Sim! Emitimos NF-e normalmente. Enviando a tabela agora 📊" },
      { direction: "inbound",  conteudo: "Tem como negociar prazo de pagamento? Quero 30/60 dias" },
    ],
  },
  {
    nome: "Priscila Santos", telefone: "5547977665544", origem: "whatsapp", status: "negociacao",
    tags: ["whatsapp", "demo"],
    messages: [
      { direction: "inbound",  conteudo: "Posso trocar se não servir?" },
      { direction: "outbound", conteudo: "Sim! Temos política de troca em até 30 dias, sem custo na primeira troca 😊" },
      { direction: "inbound",  conteudo: "Vou pegar o 37 então. Aceitam Pix?" },
      { direction: "outbound", conteudo: "Aceitamos Pix, cartão até 6x e boleto! Como prefere?" },
      { direction: "inbound",  conteudo: "Pix. Qual a chave?" },
    ],
  },
  // FECHAMENTO
  {
    nome: "Larissa Oliveira", telefone: "5521988991100", origem: "whatsapp", status: "fechamento",
    tags: ["whatsapp", "vip", "demo"],
    messages: [
      { direction: "inbound",  conteudo: "Olá! Quero finalizar o pedido dos 2 pares. Pode me mandar o Pix?" },
      { direction: "outbound", conteudo: "Oi Larissa! Chave Pix: contato@charmssandalias.com.br — Valor: R$379,80" },
      { direction: "inbound",  conteudo: "Paguei! Te mando o comprovante" },
      { direction: "outbound", conteudo: "Recebi! ✅ Vou separar e postar amanhã. Te passo o rastreio assim que sair 🚚" },
    ],
  },
  // PÓS-VENDA
  {
    nome: "Tatiane Gomes", telefone: "5511933221100", origem: "whatsapp", status: "pos-venda",
    tags: ["whatsapp", "cliente-recorrente", "demo"],
    messages: [
      { direction: "inbound",  conteudo: "Recebi o pedido! As sandálias são lindas demais 😍❤️" },
      { direction: "outbound", conteudo: "Que lindo Tati! Fico feliz! 🥰 Manda uma foto pra gente usar no stories?" },
      { direction: "inbound",  conteudo: "Vou mandar sim! Já estou usando uma delas haha" },
      { direction: "outbound", conteudo: "Temos novidades chegando semana que vem. Quer ser avisada em primeira mão?" },
      { direction: "inbound",  conteudo: "Claro!! Me avisa sim!" },
    ],
  },
  {
    nome: "Roberta Nascimento", telefone: "5581988776600", origem: "whatsapp", status: "pos-venda",
    tags: ["whatsapp", "demo"],
    messages: [
      { direction: "inbound",  conteudo: "Oi, o salto da sandália está um pouco solto. O que eu faço?" },
      { direction: "outbound", conteudo: "Oi Roberta! Que chato, me desculpe! Vou te mandar uma nova sem custo. Qual seu endereço?" },
      { direction: "inbound",  conteudo: "Nossa, muito obrigada! Ficou encantada com o atendimento 🥺" },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}
function hoursAgo(n: number) {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
}

// ── Main ──────────────────────────────────────────────────────────
async function run() {
  console.log("\n🌱 Seed de dados demo — Charms Sandálias\n");

  if (CLEAN) {
    console.log("🧹 Limpando dados de demo anteriores...");
    // Busca IDs de contatos com tag "demo"
    const { data: demoContacts } = await supabase
      .from("contacts")
      .select("id")
      .contains("tags", ["demo"]);

    if (demoContacts && demoContacts.length > 0) {
      const ids = demoContacts.map((c: { id: string }) => c.id);
      await supabase.from("messages").delete().in("contact_id", ids);
      await supabase.from("contacts").delete().in("id", ids);
      console.log(`   Removidos ${ids.length} contatos e suas mensagens.\n`);
    } else {
      console.log("   Nenhum dado de demo encontrado.\n");
    }
  }

  let created = 0;
  let msgCreated = 0;

  for (const c of CONTACTS) {
    const { data: contact, error: cErr } = await supabase
      .from("contacts")
      .insert({
        nome: c.nome,
        telefone: (c as { telefone?: string }).telefone ?? null,
        instagram_id: (c as { instagramId?: string }).instagramId ?? null,
        email: null,
        origem: c.origem,
        status: c.status,
        tags: c.tags,
        created_at: daysAgo(Math.floor(Math.random() * 20) + 1),
        last_seen_at: hoursAgo(Math.floor(Math.random() * 24)),
      })
      .select("id")
      .single();

    if (cErr || !contact) {
      console.error(`   ❌ Erro em ${c.nome}: ${cErr?.message}`);
      continue;
    }

    created++;

    if (c.messages.length > 0) {
      const msgs = c.messages.map((m, idx) => ({
        contact_id: contact.id,
        canal: c.origem === "whatsapp" ? "whatsapp" : "instagram",
        direction: m.direction,
        conteudo: m.conteudo,
        timestamp: hoursAgo(c.messages.length - idx),
        external_id: `demo-${contact.id}-${idx}`,
      }));

      const { error: mErr } = await supabase.from("messages").insert(msgs);
      if (mErr) {
        console.error(`   ❌ Mensagens de ${c.nome}: ${mErr.message}`);
      } else {
        msgCreated += msgs.length;
      }
    }

    const canal = c.origem === "whatsapp" ? "WPP" : "IG ";
    console.log(`   ✅ [${canal}] ${c.nome.padEnd(22)} → ${c.status}`);
  }

  console.log(`\n📊 Resultado:`);
  console.log(`   Contatos:  ${created}`);
  console.log(`   Mensagens: ${msgCreated}`);
  console.log(`\n🚀 Abra http://localhost:3000/dashboard\n`);
}

run().catch((err) => {
  console.error("\n❌ Erro:", err.message ?? err);
  process.exit(1);
});
