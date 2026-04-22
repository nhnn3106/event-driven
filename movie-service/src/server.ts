import { Server } from "http";

import { createApp } from "./app";
import { env } from "./config/env";
import { disconnectPrisma } from "./infrastructure/db/prisma";
import { kafkaConnection } from "./infrastructure/kafka/kafka.client";
import { logger } from "./lib/logger";

const app = createApp();
let server: Server;

function registerShutdown(signal: NodeJS.Signals): void {
  process.on(signal, () => {
    void shutdown(signal);
  });
}

async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, "Shutdown signal received.");

  if (server) {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

  await Promise.allSettled([kafkaConnection.disconnect(), disconnectPrisma()]);
  logger.info("Service stopped cleanly.");
  process.exit(0);
}

async function bootstrap(): Promise<void> {
  await kafkaConnection.connect();

  server = app.listen(env.PORT, env.SERVICE_HOST, () => {
    logger.info(
      { host: env.SERVICE_HOST, port: env.PORT },
      "Movie Service is listening.",
    );
  });

  registerShutdown("SIGINT");
  registerShutdown("SIGTERM");
}

bootstrap().catch((error) => {
  const message =
    error instanceof Error ? error.message : "Unknown startup error";
  logger.error({ error: message }, "Failed to start Movie Service.");
  process.exit(1);
});
