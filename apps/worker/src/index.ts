import crypto from "node:crypto";
import dotenv from "dotenv";
import Fastify, { type FastifyRequest } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import { z } from "zod";
import { inboundQueue } from "./queues";
import { startProcessor } from "./processor";

dotenv.config({ path: "../../.env.local" });

const VERIFY_TOKEN  = process.env.WEBHOOK_VERIFY_TOKEN ?? "charms-verify-token";
const META_APP_SECRET = process.env.META_APP_SECRET ?? "";

// Valida assinatura HMAC-SHA256 que a Meta envia no header X-Hub-Signature-256
function verifyMetaSignature(rawBody: string, signature: string | undefined): boolean {
  if (!META_APP_SECRET) return true; // variável não configurada → pula validação (dev)
  if (!signature) return false;
  const expected = `sha256=${crypto.createHmac("sha256", META_APP_SECRET).update(rawBody, "utf-8").digest("hex")}`;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "utf-8"), Buffer.from(signature, "utf-8"));
  } catch {
    return false;
  }
}

// Extende FastifyRequest para incluir rawBody capturado pelo content-type parser
declare module "fastify" {
  interface FastifyRequest {
    rawBody?: string;
  }
}

// ── Zod schemas (validação de entrada) ────────────────────────────
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

// ── Bootstrap ─────────────────────────────────────────────────────
const start = async () => {
  const app = Fastify({ logger: true });

  // Captura raw body antes do parse JSON — necessário para validar assinatura Meta
  app.addContentTypeParser("application/json", { parseAs: "string" }, (req, body, done) => {
    (req as FastifyRequest).rawBody = body as string;
    try {
      done(null, JSON.parse(body as string));
    } catch (err: unknown) {
      const e = err as Error & { statusCode?: number };
      e.statusCode = 400;
      done(e, undefined);
    }
  });

  // ── Swagger / OpenAPI ──────────────────────────────────────────
  await app.register(swagger, {
    openapi: {
      info: {
        title: "Charms Sandálias — Worker API",
        description:
          "Webhooks, filas BullMQ e métricas do ecossistema omnichannel (WhatsApp + Instagram + Bling).",
        version: "1.0.0",
      },
      tags: [
        { name: "Infra", description: "Saúde e métricas do serviço" },
        { name: "Webhooks", description: "Recepção de eventos da Meta (WhatsApp e Instagram)" },
      ],
    },
  });

  await app.register(swaggerUI, {
    routePrefix: "/docs",
    uiConfig: { docExpansion: "list", deepLinking: false },
  });

  // ── Health ─────────────────────────────────────────────────────
  app.get(
    "/health",
    {
      schema: {
        tags: ["Infra"],
        summary: "Health check — Railway usa para saber se o serviço está vivo",
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "string", example: "ok" },
              ts: { type: "number", description: "Unix timestamp ms" },
            },
          },
        },
      },
    },
    async () => ({ status: "ok", ts: Date.now() })
  );

  // ── Metrics ────────────────────────────────────────────────────
  app.get(
    "/metrics",
    {
      schema: {
        tags: ["Infra"],
        summary: "Contadores da fila BullMQ (inbound-messages)",
        response: {
          200: {
            type: "object",
            properties: {
              queue: {
                type: "object",
                properties: {
                  waiting: { type: "number" },
                  active: { type: "number" },
                  failed: { type: "number" },
                },
              },
              ts: { type: "number" },
            },
          },
        },
      },
    },
    async () => {
      const [waiting, active, failed] = await Promise.all([
        inboundQueue.getWaitingCount(),
        inboundQueue.getActiveCount(),
        inboundQueue.getFailedCount(),
      ]);
      return { queue: { waiting, active, failed }, ts: Date.now() };
    }
  );

  // ── Webhook verification GET ───────────────────────────────────
  app.get<HubQuery>(
    "/webhook/whatsapp",
    {
      schema: {
        tags: ["Webhooks"],
        summary: "Verificação de token — Meta chama isso ao registrar o webhook",
        querystring: {
          type: "object",
          properties: {
            "hub.mode": { type: "string" },
            "hub.verify_token": { type: "string" },
            "hub.challenge": { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const mode = request.query["hub.mode"];
      const token = request.query["hub.verify_token"];
      const challenge = request.query["hub.challenge"];
      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        return reply.status(200).send(challenge);
      }
      return reply.status(403).send({ error: "Forbidden" });
    }
  );

  app.get<HubQuery>(
    "/webhook/instagram",
    {
      schema: {
        tags: ["Webhooks"],
        summary: "Verificação de token — Meta chama isso ao registrar o webhook",
        querystring: {
          type: "object",
          properties: {
            "hub.mode": { type: "string" },
            "hub.verify_token": { type: "string" },
            "hub.challenge": { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const mode = request.query["hub.mode"];
      const token = request.query["hub.verify_token"];
      const challenge = request.query["hub.challenge"];
      if (mode === "subscribe" && token === VERIFY_TOKEN) {
        return reply.status(200).send(challenge);
      }
      return reply.status(403).send({ error: "Forbidden" });
    }
  );

  // ── Webhook POST — enfileira, não processa na request ─────────
  app.post(
    "/webhook/whatsapp",
    {
      schema: {
        tags: ["Webhooks"],
        summary: "Recebe evento WhatsApp Cloud API — enfileira no BullMQ e responde 200",
        response: {
          200: { type: "object", properties: { received: { type: "boolean" } } },
          403: { type: "object", properties: { error: { type: "string" } } },
        },
      },
    },
    async (request, reply) => {
      const sig = request.headers["x-hub-signature-256"] as string | undefined;
      if (!verifyMetaSignature(request.rawBody ?? "", sig)) {
        request.log.warn("whatsapp webhook: assinatura inválida");
        return reply.status(403).send({ error: "Invalid signature" });
      }

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
    }
  );

  app.post(
    "/webhook/instagram",
    {
      schema: {
        tags: ["Webhooks"],
        summary: "Recebe evento Instagram Graph API — enfileira no BullMQ e responde 200",
        response: {
          200: { type: "object", properties: { received: { type: "boolean" } } },
          403: { type: "object", properties: { error: { type: "string" } } },
        },
      },
    },
    async (request, reply) => {
      const sig = request.headers["x-hub-signature-256"] as string | undefined;
      if (!verifyMetaSignature(request.rawBody ?? "", sig)) {
        request.log.warn("instagram webhook: assinatura inválida");
        return reply.status(403).send({ error: "Invalid signature" });
      }

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
    }
  );

  // ── Start ──────────────────────────────────────────────────────
  startProcessor(app.log);

  const port = Number(process.env.PORT ?? 3001);
  await app.listen({ port, host: "0.0.0.0" });
  app.log.info(`Worker  →  http://0.0.0.0:${port}`);
  app.log.info(`Swagger →  http://0.0.0.0:${port}/docs`);
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
