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

// ── Produtos reais do site sandaliascharms.com.br ─────────────────
const BASE = "https://images.tcdn.com.br/img/img_prod/1224602/";
const img = (file: string) => BASE + file;

// Fallbacks por modelo para variações de cor sem URL própria
const BARB_IMG     = img("sandlia_brbara_vermelho_salto_baixo_1_20260505105648_fb3ef1ce3123.jpg");
const ZOUK_IMG     = img("sandlia_zouk_caramelo_1_20260304183637_f30e8877ce38.jpg");
const ZOUK_SB_IMG  = img("sandlia_zouk_caramelo_salto_baixo_1_20260304183247_05cb54d034cd.jpg");

const PRODUCTS = [
  // Lançamentos
  { nome: "Sandália Paola Prata",                categoria: "Lançamentos",   cor: "Prata",         cor_hex: "#B8B8B8", preco: 289.00, preco_pix: 277.44, numeracao: "33-40", disponivel: true,  destaque: true,  sku: "PAOLA-PRT",      imagem_url: img("sandlia_paola_prata_1_20260304180540_d351bebc8a35.jpg") },
  { nome: "Sandália Paola Preto",                categoria: "Lançamentos",   cor: "Preto",         cor_hex: "#1A1010", preco: 269.00, preco_pix: 258.24, numeracao: "33-40", disponivel: true,  destaque: false, sku: "PAOLA-PTO",      imagem_url: img("sandalia_paola_43_1_4b8f80656d9554675eccd3c5f9512e83.jpg") },
  { nome: "Sandália Paola Nude Salto Baixo",     categoria: "Lançamentos",   cor: "Nude",          cor_hex: "#F0D9C0", preco: 269.00, preco_pix: 258.24, numeracao: "33-40", disponivel: true,  destaque: false, sku: "PAOLA-NUD-SB",   imagem_url: img("sandlia_paola_prata_1_20260304180540_d351bebc8a35.jpg") },
  { nome: "Sandália Paola Marsala",              categoria: "Lançamentos",   cor: "Marsala",       cor_hex: "#8B3A3A", preco: 299.00, preco_pix: 287.04, numeracao: "33-40", disponivel: true,  destaque: true,  sku: "PAOLA-MAR",      imagem_url: img("sandlia_paola_marsala_1_20260505110038_a82dd286d911.jpg") },
  { nome: "Sandália Paola Marsala Salto Baixo",  categoria: "Lançamentos",   cor: "Marsala",       cor_hex: "#8B3A3A", preco: 299.00, preco_pix: 287.04, numeracao: "33-40", disponivel: true,  destaque: true,  sku: "PAOLA-MAR-SB",   imagem_url: img("sandlia_paola_marsala_salto_baixo_1_20260505110516_e51a0479467f.jpg") },
  { nome: "Sandália Zouk Caramelo",              categoria: "Lançamentos",   cor: "Caramelo",      cor_hex: "#C17F24", preco: 289.00, preco_pix: 277.44, numeracao: "33-40", disponivel: true,  destaque: true,  sku: "ZOUK-CAR",       imagem_url: ZOUK_IMG },
  { nome: "Sandália Zouk Caramelo Salto Baixo",  categoria: "Lançamentos",   cor: "Caramelo",      cor_hex: "#C17F24", preco: 289.00, preco_pix: 277.44, numeracao: "33-40", disponivel: true,  destaque: true,  sku: "ZOUK-CAR-SB",    imagem_url: ZOUK_SB_IMG },
  { nome: "Sandália Laura Salto Baixo Dourada",  categoria: "Lançamentos",   cor: "Dourado",       cor_hex: "#C5A028", preco: 289.00, preco_pix: 277.44, numeracao: "33-40", disponivel: true,  destaque: true,  sku: "LAURA-DOU-SB",   imagem_url: img("sandlia_laura_salto_baixo_dourada_1_20260305091450_fbb07f3c49d2.jpg") },
  { nome: "Sandália Bárbara Vermelho Salto Baixo", categoria: "Lançamentos", cor: "Vermelho",      cor_hex: "#C41E3A", preco: 299.00, preco_pix: 287.04, numeracao: "33-39", disponivel: true,  destaque: true,  sku: "BARB-VRM-SB",    imagem_url: BARB_IMG },
  { nome: "Sandália Flávia Caramelo",            categoria: "Lançamentos",   cor: "Caramelo",      cor_hex: "#C17F24", preco: 299.00, preco_pix: 287.04, numeracao: "33-40", disponivel: true,  destaque: true,  sku: "FLAV-CAR",       imagem_url: img("sandlia_flvia_caramelo_1_20260505105206_5f5af14abc4b.jpg") },
  { nome: "Sandália Isabela Nude Salto Baixo",   categoria: "Lançamentos",   cor: "Nude",          cor_hex: "#F0D9C0", preco: 299.00, preco_pix: 287.04, numeracao: "33-39", disponivel: true,  destaque: true,  sku: "ISAB-NUD-SB",    imagem_url: img("sandlia_isabela_nude_salto_baixo_1_20260429113259_b1fa2ac62a97.jpg") },
  { nome: "Sandália Bia Marrom",                 categoria: "Lançamentos",   cor: "Marrom",        cor_hex: "#795548", preco: 299.00, preco_pix: 287.04, numeracao: "33-39", disponivel: true,  destaque: true,  sku: "BIA-MAR",        imagem_url: img("sandlia_bia_marrom_1_20260429113542_51369b426eb0.jpg") },
  // Mais Vendidos
  { nome: "Sandália Duas Tiras Nude",            categoria: "Mais Vendidos", cor: "Nude",          cor_hex: "#F0D9C0", preco: 249.00, preco_pix: 239.04, numeracao: "33-40", disponivel: true,  destaque: true,  sku: "DT-NUD",         imagem_url: img("sandalia_duas_tiras_23_1_93b5a61684bc5343a45b6590d0f476b6.jpg") },
  { nome: "Sandália Duas Tiras Nude Salto Baixo",categoria: "Mais Vendidos", cor: "Nude",          cor_hex: "#F0D9C0", preco: 249.00, preco_pix: 239.04, numeracao: "33-40", disponivel: true,  destaque: true,  sku: "DT-NUD-SB",      imagem_url: img("duas_tiras_salto_baixo_41_1_4e2afe5d9388ffa4c940636de383d05e.jpg") },
  { nome: "Sandália Duas Tiras Preto",           categoria: "Mais Vendidos", cor: "Preto",         cor_hex: "#1A1010", preco: 249.00, preco_pix: 239.04, numeracao: "33-40", disponivel: true,  destaque: true,  sku: "DT-PTO",         imagem_url: img("sandalia_duas_tiras_31_1_ac5d9812d775a69850660db71b054b57.jpg") },
  { nome: "Sandália Duas Tiras Preto Salto Baixo", categoria: "Mais Vendidos", cor: "Preto",       cor_hex: "#1A1010", preco: 249.00, preco_pix: 239.04, numeracao: "33-40", disponivel: true,  destaque: true,  sku: "DT-PTO-SB",      imagem_url: img("sandalia_duas_tiras_salto_baixo_33_1_be2873b55a96c6c3105f80883db062c5.jpg") },
  { nome: "Sandália Bárbara Nude",               categoria: "Mais Vendidos", cor: "Nude",          cor_hex: "#F0D9C0", preco: 269.00, preco_pix: 258.24, numeracao: "33-39", disponivel: true,  destaque: true,  sku: "BARB-NUD",       imagem_url: BARB_IMG },
  { nome: "Sandália Bárbara Nude Salto Baixo",   categoria: "Mais Vendidos", cor: "Nude",          cor_hex: "#F0D9C0", preco: 269.00, preco_pix: 258.24, numeracao: "33-39", disponivel: true,  destaque: true,  sku: "BARB-NUD-SB",    imagem_url: BARB_IMG },
  { nome: "Sandália Bárbara Preto",              categoria: "Mais Vendidos", cor: "Preto",         cor_hex: "#1A1010", preco: 269.00, preco_pix: 258.24, numeracao: "33-39", disponivel: true,  destaque: false, sku: "BARB-PTO",       imagem_url: BARB_IMG },
  { nome: "Sandália Bárbara Preto Salto Baixo",  categoria: "Mais Vendidos", cor: "Preto",         cor_hex: "#1A1010", preco: 269.00, preco_pix: 258.24, numeracao: "33-39", disponivel: true,  destaque: true,  sku: "BARB-PTO-SB",    imagem_url: BARB_IMG },
  { nome: "Sandália Zouk Nude",                  categoria: "Mais Vendidos", cor: "Nude",          cor_hex: "#F0D9C0", preco: 269.00, preco_pix: 258.24, numeracao: "33-40", disponivel: true,  destaque: false, sku: "ZOUK-NUD",       imagem_url: ZOUK_IMG },
  { nome: "Sandália Zouk Nude Salto Baixo",      categoria: "Mais Vendidos", cor: "Nude",          cor_hex: "#F0D9C0", preco: 269.00, preco_pix: 258.24, numeracao: "33-40", disponivel: true,  destaque: true,  sku: "ZOUK-NUD-SB",    imagem_url: ZOUK_SB_IMG },
  { nome: "Sandália Zouk Preto Suede",           categoria: "Mais Vendidos", cor: "Preto Suede",   cor_hex: "#2C2C2C", preco: 269.00, preco_pix: 258.24, numeracao: "33-40", disponivel: true,  destaque: false, sku: "ZOUK-PTO-SUD",   imagem_url: ZOUK_IMG },
  { nome: "Sandália Zouk Preto Suede Salto Baixo", categoria: "Mais Vendidos", cor: "Preto Suede", cor_hex: "#2C2C2C", preco: 269.00, preco_pix: 258.24, numeracao: "33-40", disponivel: true,  destaque: true,  sku: "ZOUK-PTO-SUD-SB",imagem_url: ZOUK_SB_IMG },
  // Coleção Sensações
  { nome: "Sandália Flávia Caramelo Salto Baixo",categoria: "Sensações",     cor: "Caramelo",      cor_hex: "#C17F24", preco: 299.00, preco_pix: 287.04, numeracao: "33-40", disponivel: true,  destaque: true,  sku: "FLAV-CAR-SB",    imagem_url: img("sandlia_flvia_caramelo_salto_baixo_1_20260505105456_45b7c729f73d.jpg") },
  { nome: "Sandália Isabela Nude",               categoria: "Sensações",     cor: "Nude",          cor_hex: "#F0D9C0", preco: 299.00, preco_pix: 287.04, numeracao: "33-39", disponivel: true,  destaque: false, sku: "ISAB-NUD",       imagem_url: img("sandlia_isabela_nude_1_20260429113152_9c54bbfa32bf.jpg") },
  // Coleção Inesquecível
  { nome: "Sandália Laura Dourada",              categoria: "Inesquecível",  cor: "Dourado",       cor_hex: "#C5A028", preco: 289.00, preco_pix: 277.44, numeracao: "33-40", disponivel: true,  destaque: false, sku: "LAURA-DOU",      imagem_url: img("sandlia_laura_dourada_1_20260305091019_aa512b70b7d9.jpg") },
  { nome: "Sandália Lara Nude Brilhante",        categoria: "Inesquecível",  cor: "Nude Brilhante",cor_hex: "#EDD9B8", preco: 289.00, preco_pix: 277.44, numeracao: "33-40", disponivel: true,  destaque: false, sku: "LARA-NUB",       imagem_url: img("sandlia_lara_nude_brilhante_1_20260305100739_00f046b8ebb5.jpg") },
  { nome: "Sandália Lara Nude Brilhante Salto Baixo", categoria: "Inesquecível", cor: "Nude Brilhante", cor_hex: "#EDD9B8", preco: 289.00, preco_pix: 277.44, numeracao: "33-40", disponivel: true, destaque: false, sku: "LARA-NUB-SB", imagem_url: img("sandlia_lara_salto_baixo_nude_brilhante_1_20260305101525_b24281aeaac7.jpg") },
  { nome: "Sandália Lara Preto",                 categoria: "Inesquecível",  cor: "Preto",         cor_hex: "#1A1010", preco: 299.00, preco_pix: 287.04, numeracao: "33-40", disponivel: true,  destaque: false, sku: "LARA-PTO",       imagem_url: img("sandlia_lara_preto_1_20260429113952_6ce62d832216.jpg") },
  { nome: "Sandália Lara Preto Salto Baixo",     categoria: "Inesquecível",  cor: "Preto",         cor_hex: "#1A1010", preco: 299.00, preco_pix: 287.04, numeracao: "33-40", disponivel: false, destaque: false, sku: "LARA-PTO-SB",    imagem_url: img("sandlia_lara_preto_salto_baixo_1_20260429113850_7ac165796b1f.jpg") },
  { nome: "Sandália Isis Preta/Prata",           categoria: "Inesquecível",  cor: "Preto/Prata",   cor_hex: "#444444", preco: 289.00, preco_pix: 277.44, numeracao: "33-39", disponivel: true,  destaque: false, sku: "ISIS-PTO-PRT",   imagem_url: img("sandlia_isis_pretaprata_1_20260304181432_163d2c7f3002.jpg") },
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
    const { data: demoContacts } = await supabase
      .from("contacts")
      .select("id")
      .contains("tags", ["demo"]);

    if (demoContacts && demoContacts.length > 0) {
      const ids = demoContacts.map((c: { id: string }) => c.id);
      await supabase.from("messages").delete().in("contact_id", ids);
      await supabase.from("contacts").delete().in("id", ids);
      console.log(`   Removidos ${ids.length} contatos e suas mensagens.`);
    } else {
      console.log("   Nenhum contato demo encontrado.");
    }

    await supabase.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    console.log("   Produtos removidos.\n");
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

  // Produtos — upsert por SKU para ser idempotente
  console.log("\n🛍️  Inserindo produtos...");
  const { error: pErr } = await supabase
    .from("products")
    .upsert(PRODUCTS, { onConflict: "sku" });
  if (pErr) {
    console.error(`   ❌ Erro nos produtos: ${pErr.message}`);
  } else {
    console.log(`   ✅ ${PRODUCTS.length} produtos inseridos/atualizados`);
  }

  console.log(`\n📊 Resultado:`);
  console.log(`   Contatos:  ${created}`);
  console.log(`   Mensagens: ${msgCreated}`);
  console.log(`   Produtos:  ${PRODUCTS.length}`);
  console.log(`\n🚀 Abra http://localhost:3000/dashboard\n`);
}

run().catch((err) => {
  console.error("\n❌ Erro:", err.message ?? err);
  process.exit(1);
});
