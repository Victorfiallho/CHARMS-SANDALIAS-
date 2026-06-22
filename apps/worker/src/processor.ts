import { Worker } from "bullmq";
import { upsertContactWithIdentifiers, insertMessage } from "@charms/db";
import { connection, type InboundMessageJob } from "./queues";
import type { FastifyBaseLogger } from "fastify";

export function startProcessor(logger: FastifyBaseLogger) {
  const worker = new Worker<InboundMessageJob, void, string>(
    "inbound-messages",
    async (job) => {
      const { canal, nome, telefone, instagramId, externalId, conteudo, timestamp } = job.data;

      const contact = await upsertContactWithIdentifiers({
        nome,
        telefone,
        instagramId,
        origem: canal,
        status: "novo",
        tags: [canal],
      });

      await insertMessage({
        contactId: contact.id,
        canal,
        direction: "inbound",
        conteudo,
        externalId,
        timestamp,
      });

      logger.info({ jobId: job.id, contactId: contact.id, canal }, "job processado");
    },
    { connection, concurrency: 5 }
  );

  worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, err: err.message }, "job falhou");
  });

  return worker;
}
