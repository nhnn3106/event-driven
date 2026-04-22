import { PrismaClient } from "@prisma/client";

import { env } from "../../config/env";
import { logger } from "../../lib/logger";

export const prisma = new PrismaClient({
  datasourceUrl: env.DATABASE_URL,
});

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
  logger.info("Disconnected from PostgreSQL.");
}
