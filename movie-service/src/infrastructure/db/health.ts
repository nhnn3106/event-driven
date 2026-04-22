import { prisma } from "./prisma";

export type HealthState = "up" | "down";

export interface DatabaseHealth {
  status: HealthState;
  details?: string;
}

export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "up" };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error";
    return {
      status: "down",
      details: message,
    };
  }
}
