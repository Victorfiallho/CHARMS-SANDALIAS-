const GRAPH_BASE = "https://graph.facebook.com/v19.0";

export async function sendInstagramDM(options: {
  recipientId: string;
  text: string;
  pageId?: string;
  token?: string;
}): Promise<{ messageId: string }> {
  const pageId = options.pageId ?? process.env.INSTAGRAM_PAGE_ID;
  const token = options.token ?? process.env.INSTAGRAM_ACCESS_TOKEN;

  const res = await fetch(`${GRAPH_BASE}/${pageId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      recipient: { id: options.recipientId },
      message: { text: options.text },
      messaging_type: "RESPONSE",
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Instagram API ${res.status}: ${body}`);
  }

  const data = (await res.json()) as { message_id?: string };
  return { messageId: data.message_id ?? "" };
}
