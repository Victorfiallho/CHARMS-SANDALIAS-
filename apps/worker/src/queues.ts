import { Queue } from "bullmq";

// Passa plain object — evita conflito de tipos entre ioredis externo e o bundled do BullMQ
function parseRedisUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 6379),
    ...(parsed.password ? { password: decodeURIComponent(parsed.password) } : {}),
    maxRetriesPerRequest: null as null,
  };
}

export const connection = parseRedisUrl(process.env.REDIS_URL ?? "redis://localhost:6379");

export type InboundMessageJob = {
  canal: "whatsapp" | "instagram";
  nome: string;
  telefone?: string;
  instagramId?: string;
  externalId: string;
  conteudo: string;
  timestamp: string;
};

// NameType explícito (string) necessário no BullMQ v5 para o método add() aceitar literais
export const inboundQueue = new Queue<InboundMessageJob, void, string>("inbound-messages", {
  connection,
});
