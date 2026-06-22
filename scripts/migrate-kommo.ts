/**
 * Script de migração de leads do Kommo → Supabase (contacts)
 *
 * Uso:
 *   npx ts-node -P scripts/tsconfig.json scripts/migrate-kommo.ts <arquivo.csv>
 *
 * O arquivo CSV deve ser o export padrão do Kommo (UTF-8, vírgula ou ponto-e-vírgula).
 * O script detecta automaticamente os cabeçalhos mais comuns (PT e EN).
 *
 * Opções:
 *   --dry-run   Mostra o que seria importado sem gravar no banco
 *   --batch N   Tamanho do lote (padrão: 50)
 */

import * as fs from "fs";
import * as readline from "readline";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "../.env.local") });

import { upsertContactWithIdentifiers } from "@charms/db";
import type { ContactStatus } from "@charms/types";

// ── Configuração ────────────────────────────────────────────────────
const args = process.argv.slice(2);
const filePath = args.find((a) => !a.startsWith("--"));
const DRY_RUN = args.includes("--dry-run");
const BATCH_SIZE = Number(args.find((a) => a.startsWith("--batch="))?.split("=")[1] ?? 50);

if (!filePath) {
  console.error("Uso: npx ts-node -P scripts/tsconfig.json scripts/migrate-kommo.ts <arquivo.csv> [--dry-run] [--batch=N]");
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error(`Arquivo não encontrado: ${filePath}`);
  process.exit(1);
}

// ── Mapeamento de colunas (Kommo exporta em PT e EN) ────────────────
const FIELD_MAP: Record<string, string> = {
  // Nome
  nome: "nome",
  name: "nome",
  "nome completo": "nome",
  "full name": "nome",
  contato: "nome",
  contact: "nome",
  // Telefone
  telefone: "telefone",
  phone: "telefone",
  fone: "telefone",
  celular: "telefone",
  mobile: "telefone",
  "telefone celular": "telefone",
  "número de telefone": "telefone",
  "phone number": "telefone",
  // Email
  email: "email",
  "e-mail": "email",
  // Instagram
  instagram: "instagramId",
  "instagram id": "instagramId",
  instagram_id: "instagramId",
  // Status / Estágio
  status: "status",
  estágio: "status",
  estagio: "status",
  "estágio do funil": "status",
  "pipeline stage": "status",
  stage: "status",
  // Tags
  tags: "tags",
  etiquetas: "tags",
  labels: "tags",
  // Origem
  origem: "origem",
  origin: "origem",
  source: "origem",
  canal: "origem",
  channel: "origem",
};

// ── Normalização de status do Kommo → nosso pipeline ────────────────
function normalizeStatus(raw: string): ContactStatus {
  const s = raw.toLowerCase().trim();
  if (!s) return "novo";

  // Mapeamento de estágios comuns do Kommo para nosso pipeline
  const map: [RegExp, ContactStatus][] = [
    [/qualif|qualif/i, "qualificado"],
    [/negoc|negoti/i, "negociacao"],
    [/fech|clos|won|ganho/i, "fechamento"],
    [/pós|pos.venda|after.sale|pós-venda/i, "pos-venda"],
  ];

  for (const [pattern, status] of map) {
    if (pattern.test(s)) return status;
  }

  return "novo";
}

// ── Normalização de telefone (formato BR) ───────────────────────────
function normalizePhone(raw: string): string | undefined {
  if (!raw?.trim()) return undefined;
  // Remove tudo que não é dígito
  const digits = raw.replace(/\D/g, "");
  if (!digits) return undefined;
  // Adiciona +55 se tiver 10-11 dígitos sem DDI
  if (digits.length === 10 || digits.length === 11) return `55${digits}`;
  // Se já tem DDI (12-13 dígitos com 55)
  if (digits.length >= 12) return digits;
  return digits;
}

// ── Normalização de origem ───────────────────────────────────────────
function normalizeOrigem(raw: string): string {
  if (!raw?.trim()) return "kommo";
  const s = raw.toLowerCase().trim();
  if (s.includes("whatsapp") || s.includes("wpp") || s.includes("wha")) return "whatsapp";
  if (s.includes("instagram") || s.includes("insta") || s.includes("ig")) return "instagram";
  if (s.includes("facebook") || s.includes("fb")) return "instagram";
  return s || "kommo";
}

// ── Parser de CSV simples (suporta vírgula e ponto-e-vírgula) ────────
function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// ── Leitura e processamento ──────────────────────────────────────────
type LeadRow = {
  nome: string;
  telefone?: string;
  email?: string;
  instagramId?: string;
  status: ContactStatus;
  origem: string;
  tags: string[];
};

async function run() {
  console.log(`\n📋 Migração Kommo → Supabase`);
  console.log(`   Arquivo: ${filePath}`);
  console.log(`   Modo: ${DRY_RUN ? "DRY RUN (sem gravação)" : "PRODUÇÃO"}`);
  console.log(`   Lote: ${BATCH_SIZE} leads\n`);

  const fileStream = fs.createReadStream(filePath!, { encoding: "utf-8" });
  const rl = readline.createInterface({ input: fileStream });

  const lines: string[] = [];
  for await (const line of rl) {
    if (line.trim()) lines.push(line);
  }

  if (lines.length < 2) {
    console.error("Arquivo vazio ou sem dados.");
    process.exit(1);
  }

  // Detecta delimitador (vírgula vs ponto-e-vírgula)
  const delimiter = lines[0].includes(";") ? ";" : ",";
  console.log(`   Delimitador detectado: "${delimiter}"\n`);

  // Mapeia cabeçalhos
  const headers = parseCSVLine(lines[0], delimiter).map((h) =>
    h.toLowerCase().replace(/[^\w\s\-]/g, "").trim()
  );

  const fieldIndex: Record<string, number> = {};
  for (let i = 0; i < headers.length; i++) {
    const mapped = FIELD_MAP[headers[i]];
    if (mapped && !(mapped in fieldIndex)) {
      fieldIndex[mapped] = i;
    }
  }

  console.log(`   Colunas detectadas: ${Object.keys(fieldIndex).join(", ")}`);

  if (!("nome" in fieldIndex) && !("telefone" in fieldIndex)) {
    console.error("\nNenhuma coluna de nome ou telefone detectada. Verifique o arquivo.");
    console.error("Cabeçalhos encontrados:", headers.join(", "));
    process.exit(1);
  }

  // Processa linhas
  const leads: LeadRow[] = [];
  const skipped: number[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCSVLine(lines[i], delimiter);
    const get = (field: string) => (fieldIndex[field] !== undefined ? cols[fieldIndex[field]] ?? "" : "");

    const nome = get("nome").trim() || "Lead Kommo";
    const telefone = normalizePhone(get("telefone"));
    const email = get("email").trim() || undefined;
    const instagramId = get("instagramId").trim() || undefined;
    const tags = get("tags")
      .split(/[,|;]/)
      .map((t) => t.trim())
      .filter(Boolean);
    tags.push("kommo-import");

    if (!telefone && !email && !instagramId) {
      skipped.push(i + 1);
      continue;
    }

    leads.push({
      nome,
      telefone,
      email,
      instagramId,
      status: normalizeStatus(get("status")),
      origem: normalizeOrigem(get("origem")),
      tags,
    });
  }

  console.log(`\n   Total: ${lines.length - 1} linhas`);
  console.log(`   Válidos: ${leads.length}`);
  console.log(`   Ignorados (sem identificador): ${skipped.length}`);
  if (skipped.length > 0) {
    console.log(`   Linhas ignoradas: ${skipped.slice(0, 10).join(", ")}${skipped.length > 10 ? "..." : ""}`);
  }

  if (DRY_RUN) {
    console.log("\n── DRY RUN: primeiros 5 leads que seriam importados ──");
    leads.slice(0, 5).forEach((l, i) => console.log(`  [${i + 1}]`, JSON.stringify(l)));
    console.log("\nRode sem --dry-run para importar.");
    return;
  }

  // Importa em lotes
  let imported = 0;
  let errors = 0;
  const total = leads.length;

  console.log("\n── Importando... ──");

  for (let i = 0; i < leads.length; i += BATCH_SIZE) {
    const batch = leads.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((lead) =>
        upsertContactWithIdentifiers({
          nome: lead.nome,
          telefone: lead.telefone,
          instagramId: lead.instagramId,
          email: lead.email,
          origem: lead.origem,
          status: lead.status,
          tags: lead.tags,
        })
      )
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        imported++;
      } else {
        errors++;
        console.error("   ERRO:", result.reason?.message ?? result.reason);
      }
    }

    const pct = Math.round(((i + batch.length) / total) * 100);
    process.stdout.write(`\r   Progresso: ${i + batch.length}/${total} (${pct}%)`);
  }

  console.log(`\n\n✅ Migração concluída!`);
  console.log(`   Importados: ${imported}`);
  console.log(`   Erros:      ${errors}`);
}

run().catch((err) => {
  console.error("\nErro fatal:", err);
  process.exit(1);
});
