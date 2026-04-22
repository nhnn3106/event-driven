import { randomUUID } from "node:crypto";

import cors from "cors";
import express from "express";
import pinoHttp from "pino-http";

import { logger } from "./lib/logger";
import { errorHandler } from "./middleware/error-handler";
import { notFoundHandler } from "./middleware/not-found";
import { healthRouter } from "./modules/health/health.routes";
import { movieRouter } from "./modules/movies/movie.routes";

export function createApp() {
  const app = express();

  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.disable("x-powered-by");

  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => {
        const incomingId = req.headers["x-request-id"];
        if (typeof incomingId === "string" && incomingId.trim().length > 0) {
          return incomingId;
        }

        return randomUUID();
      },
      customLogLevel: (_req, res, error) => {
        if (error || res.statusCode >= 500) {
          return "error";
        }

        if (res.statusCode >= 400) {
          return "warn";
        }

        return "info";
      },
    }),
  );

  app.use(express.json({ limit: "1mb" }));

  app.get("/", (_req, res) => {
    res.status(200).json({
      service: "movie-service",
      status: "running",
    });
  });

  app.use("/health", healthRouter);
  app.use("/api/movies", movieRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
