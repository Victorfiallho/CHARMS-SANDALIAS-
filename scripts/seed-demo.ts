/**
 * Seed de dados demo — Charms Sandálias
 *
 * Cria contatos e mensagens realistas para demonstração do painel.
 * ATENÇÃO: use apenas em ambiente de dev/demo, nunca em produção com dados reais.
 *
 * Uso:
 *   npm run seed
 *   npm run seed -- --clean   (limpa os dados de seed antes de recriar)
 */

import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

import { supabase } from "../packages/db/src/client";

const CLEAN = process.argv.includes("--clean");

// ── Contatos demo ────────────────────────────────────────────────────
const CONTACTS = [
  // NOVO
  {
    nome: "Ana Paula Lima",
    telefone: "5511987654321",
    origem: "whatsapp",
    status: "novo",
    tags: ["whatsapp", "tráfego-pago"],
    messages: [
      { direction: "inbound", conteudo: "Oi! Vi o anúncio de vocês no Instagram. Têm sandália número 37?" },
      { direction: "outbound", conteudo: "Oi Ana Paula! Temos sim! Qual modelo te interessou? Posso te mandar as opções disponíveis no 37 😊" },
      { direction: "inbound", conteudo: "O modelo rasteirinha dourada que apareceu no stories!" },
    ],
  },
  {
    nome: "Fernanda Costa",
    telefone: "5521999887766",
    origem: "whatsapp",
    status: "novo",
    tags: ["whatsapp"],
    messages: [
      { direction: "inbound", conteudo: "Boa tarde! Vocês fazem entrega para o Rio?" },
      { direction: "outbound", conteudo: "Boa tarde, Fernanda! Sim, entregamos para todo o Brasil pelo Correios ou transportadora. Prazo para o RJ é de 2 a 4 dias úteis 📦" },
    ],
  },
  {
    nome: "Mariana Souza",
    instagramId: "mariana.souza.oficial",
    origem: "instagram",
    status: "novo",
    tags: ["instagram"],
    messages: [
      { direction: "inbound", conteudo: "Amei esse modelo! Quanto custa?" },
      { direction: "outbound", conteudo: "Oii Mariana! Esse modelo está R$189,90. Tem frete grátis acima de R$250 💛" },
      { direction: "inbound", conteudo: "Tem parcelamento?" },
    ],
  },
  // QUALIFICADO
  {
    nome: "Juliana Mendes",
    telefone: "5531988776655",
    origem: "whatsapp",
    status: "qualificado",
    tags: ["whatsapp", "interessada-kit"],
    messages: [
      { direction: "inbound", conteudo: "Olá! Quero comprar 3 pares diferentes pra presentear. Tem algum desconto?" },
      { direction: "outbound", conteudo: "Oi Juliana! Que fofo presente! Sim, para compras acima de R$500 temos 10% de desconto 🎁 Me conta quais modelos te chamaram atenção?" },
      { direction: "inbound", conteudo: "A rasteirinha, a tamanca anabela e a papete. Quanto sai os 3?" },
      { direction: "outbound", conteudo: "Os 3 juntos saem R$567 sem desconto. Com o desconto de 10%: R$510,30 com frete grátis! Quer que eu monte o pedido?" },
      { direction: "inbound", conteudo: "Sim! Mas preciso confirmar o número de uma delas. Te falo hoje à noite?" },
    ],
  },
  {
    nome: "Beatriz Rodrigues",
    instagramId: "bearodrigues__",
    origem: "instagram",
    status: "qualificado",
    tags: ["instagram", "influencer"],
    messages: [
      { direction: "inbound", conteudo: "Oi! Sou influenciadora e adorei os produtos de vocês. Topam uma parceria de divulgação?" },
      { direction: "outbound", conteudo: "Oi Beatriz! Que bacana! Vou passar para a responsável pelas parcerias. Pode me informar seu @ e número de seguidores?" },
      { direction: "inbound", conteudo: "@bearodrigues__ com 45k seguidores, nicho de moda e lifestyle" },
    ],
  },
  // NEGOCIAÇÃO
  {
    nome: "Camila Ferreira",
    telefone: "5511944332211",
    origem: "whatsapp",
    status: "negociacao",
    tags: ["whatsapp", "atacado"],
    messages: [
      { direction: "inbound", conteudo: "Tenho uma boutique em SP e quero comprar no atacado. Qual o mínimo?" },
      { direction: "outbound", conteudo: "Oi Camila! Para atacado o mínimo é 12 pares por modelo. Posso te mandar nossa tabela de preços?" },
      { direction: "inbound", conteudo: "Sim, por favor! E vocês trabalham com CNPJ?" },
      { direction: "outbound", conteudo: "Sim! Emitimos NF-e normalmente. Enviando a tabela agora 📊" },
      { direction: "inbound", conteudo: "Recebi! Estou analisando. Tem como negociar o prazo de pagamento? Quero 30/60 dias" },
      { direction: "outbound", conteudo: "Para pedidos acima de R$3.000 conseguimos 30/60 dias sim. Qual seria o volume do primeiro pedido?" },
    ],
  },
  {
    nome: "Priscila Santos",
    telefone: "5547977665544",
    origem: "whatsapp",
    status: "negociacao",
    tags: ["whatsapp"],
    messages: [
      { direction: "inbound", conteudo: "Oi! Quero o kit verão mas estou em dúvida do número. Posso trocar se não servir?" },
      { direction: "outbound", conteudo: "Oi Pri! Sim! Temos política de troca em até 30 dias, sem custo de envio na primeira troca 😊" },
      { direction: "inbound", conteudo: "Perfeito! Vou pegar o 37 então. Aceitam Pix?" },
      { direction: "outbound", conteudo: "Aceitamos Pix, cartão de crédito até 6x e boleto! Como prefere?" },
      { direction: "inbound", conteudo: "Pix. Qual a chave?" },
    ],
  },
  // FECHAMENTO
  {
    nome: "Larissa Oliveira",
    telefone: "5521988991100",
    origem: "whatsapp",
    status: "fechamento",
    tags: ["whatsapp", "vip"],
    messages: [
      { direction: "inbound", conteudo: "Olá! Quero finalizar o pedido dos 2 pares. Pode me mandar o Pix?" },
      { direction: "outbound", conteudo: "Oi Larissa! Claro! Chave Pix: contato@charmssandalias.com.br — Valor: R$379,80" },
      { direction: "inbound", conteudo: "Paguei! Te mando o comprovante" },
      { direction: "outbound", conteudo: "Recebi! ✅ Pedido confirmado. Vou separar e postar amanhã. Te passo o código de rastreio assim que sair 🚚" },
      { direction: "inbound", conteudo: "Ótimo! Obrigada pela atenção!" },
    ],
  },
  {
    nome: "Vanessa Almeida",
    instagramId: "vanessa_almeida_moda",
    origem: "instagram",
    status: "fechamento",
    tags: ["instagram"],
    messages: [
      { direction: "inbound", conteudo: "Boa noite! Já vi o comprovante no email. Quando chega aqui em BH?" },
      { direction: "outbound", conteudo: "Boa noite Vanessa! Seu pedido foi postado hoje. Para BH o prazo dos Correios é 3 a 5 dias úteis. Rastreio: BR123456789BR" },
      { direction: "inbound", conteudo: "Obrigada! Já rastreei e está a caminho 😍" },
    ],
  },
  // PÓS-VENDA
  {
    nome: "Tatiane Gomes",
    telefone: "5511933221100",
    origem: "whatsapp",
    status: "pos-venda",
    tags: ["whatsapp", "cliente-recorrente"],
    messages: [
      { direction: "inbound", conteudo: "Oi! Recebi o pedido! As sandálias são lindas demais 😍❤️" },
      { direction: "outbound", conteudo: "Que lindo Tati! Fico feliz que gostou! 🥰 Se puder, manda uma foto pra gente? Adoramos ver nossas clientes usando!" },
      { direction: "inbound", conteudo: "Vou mandar sim! Já estou usando uma delas haha" },
      { direction: "outbound", conteudo: "Que fofo! 😍 Já que você amou, temos novidades chegando semana que vem. Quer que eu te avise em primeira mão?" },
      { direction: "inbound", conteudo: "Claro!! Me avisa sim!" },
    ],
  },
  {
    nome: "Roberta Nascimento",
    telefone: "5581988776600",
    origem: "whatsapp",
    status: "pos-venda",
    tags: ["whatsapp", "reclamacao-resolvida"],
    messages: [
      { direction: "inbound", conteudo: "Oi, o salto da sandália que recebi está um pouco solto. O que eu faço?" },
      { direction: "outbound", conteudo: "Oi Roberta! Que chato isso, me desculpe! Vou te mandar uma nova imediatamente sem custo. Pode ficar com essa também. Qual seu endereço?" },
      { direction: "inbound", conteudo: "Nossa, muito obrigada! Ficou encantada com o atendimento 🥺" },
      { direction: "outbound", conteudo: "Obrigada Roberta! Sua satisfação é o mais importante pra gente. O novo par sai amanhã 💛" },
    ],
  },
];

// ── Funções auxiliares ───────────────────────────────────────────────
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function hoursAgo(n: number): string {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
}

// ── Main ─────────────────────────────────────────────────────────────
async function run() {
  console.log("\n🌱 Seed de dados demo — Charms Sandálias\n");

  if (CLEAN) {
    console.log("🧹 Limpando dados de seed anteriores...");
    await supabase.from("messages").delete().contains("contact_id", []);
    const { error } = await supabase
      .from("contacts")
      .delete()
      .contains("tags", ["kommo-import"])
      .or("tags.cs.{whatsapp},tags.cs.{instagram}");
    // Limpa por tag de demo
    await supabase.from("contacts").delete().ilike("tags::text", "%demo%");
    console.log("   Feito.\n");
  }

  let created = 0;
  let msgCreated = 0;

  for (let i = 0; i < CONTACTS.length; i++) {
    const c = CONTACTS[i];
    const tags = [...(c.tags ?? []), "demo"];

    // Upsert do contato
    const { data: contact, error: cErr } = await supabase
      .from("contacts")
      .insert({
        nome: c.nome,
        telefone: c.telefone ?? null,
        instagram_id: c.instagramId ?? null,
        email: null,
        origem: c.origem,
        status: c.status,
        tags,
        created_at: daysAgo(Math.floor(Math.random() * 30) + 1),
        last_seen_at: hoursAgo(Math.floor(Math.random() * 48)),
      })
      .select("id")
      .single();

    if (cErr || !contact) {
      console.error(`   ERRO ao criar ${c.nome}:`, cErr?.message);
      continue;
    }

    created++;

    // Insere mensagens
    if (c.messages?.length) {
      const msgs = c.messages.map((m, idx) => ({
        contact_id: contact.id,
        canal: c.origem,
        direction: m.direction,
        conteudo: m.conteudo,
        timestamp: hoursAgo(c.messages.length - idx),
        external_id: `demo-${contact.id}-${idx}`,
      }));

      const { error: mErr } = await supabase.from("messages").insert(msgs);
      if (mErr) {
        console.error(`   ERRO nas mensagens de ${c.nome}:`, mErr.message);
      } else {
        msgCreated += msgs.length;
      }
    }

    const canal = c.origem === "whatsapp" ? "WPP" : "IG ";
    console.log(`   ✅ [${canal}] ${c.nome.padEnd(22)} → ${c.status}`);
  }

  console.log(`\n📊 Resultado:`);
  console.log(`   Contatos criados:  ${created}`);
  console.log(`   Mensagens criadas: ${msgCreated}`);
  console.log(`\n🚀 Abra http://localhost:3000/dashboard para ver o Kanban!\n`);
}

run().catch((err) => {
  console.error("\n❌ Erro fatal:", err.message ?? err);
  process.exit(1);
});
