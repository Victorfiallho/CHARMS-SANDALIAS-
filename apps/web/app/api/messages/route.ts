import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendWhatsAppMessage, sendInstagramDM } from "@charms/integrations";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { contactId, text } = body as { contactId?: string; text?: string };

  if (!contactId || !text?.trim()) {
    return NextResponse.json({ error: "contactId e text são obrigatórios" }, { status: 400 });
  }

  const { data: contact, error: contactError } = await supabase
    .from("contacts")
    .select("*")
    .eq("id", contactId)
    .single();

  if (contactError || !contact) {
    return NextResponse.json({ error: "contato não encontrado" }, { status: 404 });
  }

  let externalId: string;
  let canal: "whatsapp" | "instagram";

  try {
    if (contact.telefone) {
      canal = "whatsapp";
      const { messageId } = await sendWhatsAppMessage({ to: contact.telefone, text: text.trim() });
      externalId = messageId || `out-wpp-${Date.now()}`;
    } else if (contact.instagram_id) {
      canal = "instagram";
      const { messageId } = await sendInstagramDM({ recipientId: contact.instagram_id, text: text.trim() });
      externalId = messageId || `out-ig-${Date.now()}`;
    } else {
      return NextResponse.json({ error: "contato sem canal de envio configurado" }, { status: 422 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "erro ao enviar mensagem";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const { data: msg, error: msgError } = await supabase
    .from("messages")
    .insert({
      contact_id: contactId,
      canal,
      direction: "outbound",
      conteudo: text.trim(),
      timestamp: new Date().toISOString(),
      external_id: externalId,
    })
    .select("*")
    .single();

  if (msgError) return NextResponse.json({ error: msgError.message }, { status: 500 });
  return NextResponse.json(msg);
}
