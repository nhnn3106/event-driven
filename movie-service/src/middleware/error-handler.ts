import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";

import { AppError } from "../lib/errors";
import { logger } from "../lib/logger";

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      statusCode: 400,
      error: "Validation failed",
      details: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      statusCode: error.statusCode,
      error: error.message,
      code: error.code,
    });
    return;
  }

  const message = error instanceof Error ? error.message : "Unexpected error";
  logger.error(
    { err: message, path: req.originalUrl, method: req.method },
    "Unhandled application error",
  );

  res.status(500).json({
    statusCode: 500,
    error: "Internal Server Error",
  });
};
