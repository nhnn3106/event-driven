import { NextFunction, Request, Response } from "express";

import { env } from "../../config/env";
import { checkDatabaseHealth } from "../../infrastructure/db/health";
import { kafkaConnection } from "../../infrastructure/kafka/kafka.client";

export async function getHealthHandler(
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const [database, kafka] = await Promise.all([
      checkDatabaseHealth(),
      kafkaConnection.health(),
    ]);

    const isDown =
      database.status === "down" ||
      (env.KAFKA_REQUIRED && kafka.status === "down");
    const isDegraded = !isDown && kafka.status === "down";

    const overallStatus = isDown ? "down" : isDegraded ? "degraded" : "up";
    const statusCode = isDown ? 503 : 200;

    res.status(statusCode).json({
      status: overallStatus,
      service: "movie-service",
      timestamp: new Date().toISOString(),
      checks: {
        database,
        kafka,
      },
    });
  } catch (error) {
    next(error);
  }
}
