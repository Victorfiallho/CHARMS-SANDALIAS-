import dotenv from "dotenv";
import Fastify from "fastify";
import { z } from "zod";
import { inboundQueue } from "./queues";
import { startProcessor } from "./processor";

dotenv.config({ path: "../../.env.local" });

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN ?? "charms-verify-token";

const app = Fastify({ logger: true });

// ── Health ────────────────────────────────────────────────────────────────
app.get("/health", async () => ({ status: "ok", ts: Date.now() }));

// ── Metrics ───────────────────────────────────────────────────────────────
app.get("/metrics", async () => {
  const [waiting, active, failed] = await Promise.all([
    inboundQueue.getWaitingCount(),
    inboundQueue.getActiveCount(),
    inboundQueue.getFailedCount(),
  ]);
  return { queue: { waiting, active, failed }, ts: Date.now() };
});

// ── Zod schemas ───────────────────────────────────────────────────────────
const whatsappWebhookSchema = z.object({
  entry: z.array(
    z.object({
      changes: z.array(
        z.object({
          value: z.object({
            contacts: z
              .array(
                z.object({
                  profile: z.object({ name: z.string().optional() }).optional(),
                  wa_id: z.string().optional(),
                })
              )
              .optional()
              .default([]),
            messages: z
              .array(
                z.object({
                  id: z.string(),
                  from: z.string(),
                  text: z.object({ body: z.string().optional() }).optional(),
                  timestamp: z.string(),
                })
              )
              .optional()
              .default([]),
          }),
        })
      ),
    })
  ),
});

const instagramWebhookSchema = z.object({
  entry: z.array(
    z.object({
      changes: z.array(
        z.object({
          value: z.object({
            sender_id: z.string().optional(),
            message: z.object({ text: z.string().optional() }).optional(),
            received_timestamp: z.string().optional(),
          }),
        })
      ),
    })
  ),
});

type HubQuery = {
  Querystring: {
    "hub.mode"?: string;
    "hub.verify_token"?: string;
    "hub.challenge"?: string;
  };
};

// ── Webhook verification GET ──────────────────────────────────────────────
app.get<HubQuery>("/webhook/whatsapp", async (request, reply) => {
  const mode = request.query["hub.mode"];
  const token = request.query["hub.verify_token"];
  const challenge = request.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return reply.status(200).send(challenge);
  }
  return reply.status(403).send({ error: "Forbidden" });
});

app.get<HubQuery>("/webhook/instagram", async (request, reply) => {
  const mode = request.query["hub.mode"];
  const token = request.query["hub.verify_token"];
  const challenge = request.query["hub.challenge"];
  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return reply.status(200).send(challenge);
  }
  return reply.status(403).send({ error: "Forbidden" });
});

// ── Webhook POST — enfileira, não processa na request ────────────────────
app.post("/webhook/whatsapp", async (request, reply) => {
  const parsed = whatsappWebhookSchema.safeParse(request.body);
  if (!parsed.success) {
    request.log.warn({ err: parsed.error }, "whatsapp payload inválido");
    return reply.status(200).send({ received: true });
  }

  const change = parsed.data.entry[0]?.changes?.[0];
  const contact = change?.value.contacts?.[0];
  const message = change?.value.messages?.[0];

  if (!contact || !message) {
    return reply.status(200).send({ received: true });
  }

  // Correção do bug @lid: wa_id pode vir como GUID (@lid), usa message.from como fallback
  const telefone =
    contact.wa_id && !contact.wa_id.includes("@lid")
      ? contact.wa_id
      : message.from;

  await inboundQueue.add("whatsapp-inbound", {
    canal: "whatsapp",
    nome: contact.profile?.name ?? "Lead WhatsApp",
    telefone,
    externalId: message.id,
    conteudo: message.text?.body ?? "",
    timestamp: new Date(Number(message.timestamp) * 1000).toISOString(),
  });

  return reply.status(200).send({ received: true });
});

app.post("/webhook/instagram", async (request, reply) => {
  const parsed = instagramWebhookSchema.safeParse(request.body);
  if (!parsed.success) {
    request.log.warn({ err: parsed.error }, "instagram payload inválido");
    return reply.status(200).send({ received: true });
  }

  const change = parsed.data.entry[0]?.changes?.[0];
  const value = change?.value;

  if (!value?.sender_id) {
    return reply.status(200).send({ received: true });
  }

  await inboundQueue.add("instagram-inbound", {
    canal: "instagram",
    nome: "Lead Instagram",
    instagramId: value.sender_id,
    externalId: `${value.sender_id}:${value.received_timestamp ?? Date.now()}`,
    conteudo: value.message?.text ?? "",
    timestamp: value.received_timestamp
      ? new Date(Number(value.received_timestamp) * 1000).toISOString()
      : new Date().toISOString(),
  });

  return reply.status(200).send({ received: true });
});

// ── Bootstrap ─────────────────────────────────────────────────────────────
const start = async () => {
  try {
    startProcessor(app.log);
    const port = Number(process.env.PORT ?? 3001);
    await app.listen({ port, host: "0.0.0.0" });
    app.log.info(`Worker listening on http://0.0.0.0:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
