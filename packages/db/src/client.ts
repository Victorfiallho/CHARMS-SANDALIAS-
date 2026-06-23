import { createClient } from "@supabase/supabase-js";
import type { ContactStatus } from "@charms/types";

const supabaseUrl = process.env.SUPABASE_URL || "https://placeholder.supabase.co";
// service role bypasses RLS — necessário no worker (server-side)
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
});

function buildContactFilter(telefone?: string, instagramId?: string, email?: string) {
  const conditions: string[] = [];

  if (telefone) {
    conditions.push(`telefone.eq.${telefone}`);
  }

  if (instagramId) {
    conditions.push(`instagram_id.eq.${instagramId}`);
  }

  if (email) {
    conditions.push(`email.eq.${email}`);
  }

  return conditions.length > 0 ? conditions.join(",") : undefined;
}

export type ContactRecord = {
  id: string;
  nome: string;
  telefone?: string | null;
  instagram_id?: string | null;
  email?: string | null;
  origem: string;
  status: ContactStatus;
  tags: string[];
  created_at: string;
  last_seen_at?: string | null;
};

export async function findContactByIdentifiers(options: {
  telefone?: string;
  instagramId?: string;
  email?: string;
}) {
  const { telefone, instagramId, email } = options;
  const filter = buildContactFilter(telefone, instagramId, email);

  if (!filter) {
    return null;
  }

  const query = supabase
    .from("contacts")
    .select("*")
    .limit(1);
  const request = filter ? query.or(filter) : query;
  const { data, error } = await request;

  if (error) {
    throw error;
  }

  return (data as ContactRecord[] | null)?.[0] ?? null;
}

export async function upsertContactWithIdentifiers(options: {
  nome: string;
  telefone?: string;
  instagramId?: string;
  email?: string;
  origem: string;
  status?: ContactStatus;
  tags?: string[];
}) {
  const { nome, telefone, instagramId, email, origem, status = "novo", tags = [] } = options;
  const existing = await findContactByIdentifiers({ telefone, instagramId, email });

  if (existing) {
    const update: Partial<ContactRecord> = {
      nome,
      origem,
      // Não sobrescreve status — contato existente mantém o estágio do pipeline
      last_seen_at: new Date().toISOString(),
    };

    if (telefone) {
      update.telefone = telefone;
    }

    if (instagramId) {
      update.instagram_id = instagramId;
    }

    if (email) {
      update.email = email;
    }

    const { data, error } = await supabase
      .from("contacts")
      .update(update as ContactRecord)
      .eq("id", existing.id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return data as ContactRecord;
  }

  const { data, error } = await supabase
    .from("contacts")
    .insert([
      {
        nome,
        telefone: telefone || null,
        instagram_id: instagramId || null,
        email: email || null,
        origem,
        status,
        tags,
      },
    ])
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as ContactRecord;
}

export type MessageRecord = {
  id: string;
  contact_id: string;
  conversation_id?: string | null;
  canal: string;
  direction: string;
  conteudo: string;
  timestamp: string;
  external_id: string;
  created_at: string;
};

export async function insertMessage(options: {
  contactId: string;
  conversationId?: string | null;
  canal: string;
  direction: string;
  conteudo: string;
  externalId: string;
  timestamp: string;
}) {
  const { contactId, conversationId = null, canal, direction, conteudo, externalId, timestamp } = options;
  const { data, error } = await supabase
    .from("messages")
    .upsert(
      {
        contact_id: contactId,
        conversation_id: conversationId,
        canal,
        direction,
        conteudo,
        timestamp,
        external_id: externalId,
      } as MessageRecord,
      { onConflict: "external_id" }
    )
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as MessageRecord;
}
