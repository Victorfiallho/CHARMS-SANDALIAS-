const GRAPH_BASE = "https://graph.facebook.com/v19.0";

export async function sendWhatsAppMessage(options: {
  to: string;
  text: string;
  phoneNumberId?: string;
  token?: string;
}): Promise<{ messageId: string }> {
  const phoneNumberId = options.phoneNumberId ?? process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = options.token ?? process.env.WHATSAPP_TOKEN;

  const res = await fetch(`${GRAPH_BASE}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: options.to,
      type: "text",
      text: { body: options.text },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WhatsApp API ${res.status}: ${body}`);
  }

  const data = (await res.json()) as { messages?: Array<{ id: string }> };
  return { messageId: data.messages?.[0]?.id ?? "" };
}
