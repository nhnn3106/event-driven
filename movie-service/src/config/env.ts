import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(8082),
  SERVICE_HOST: z.string().default("0.0.0.0"),
  DATABASE_URL: z
    .string()
    .min(1)
    .default("postgresql://postgres:postgres@localhost:5432/movie_service"),
  KAFKA_BROKERS: z
    .string()
    .default("localhost:9092")
    .transform((value) =>
      value
        .split(",")
        .map((broker) => broker.trim())
        .filter((broker) => broker.length > 0),
    ),
  KAFKA_CLIENT_ID: z.string().default("movie-service"),
  KAFKA_REQUIRED: z
    .string()
    .default("false")
    .transform((value) => value.toLowerCase() === "true"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
    .default("info"),
});

const parseResult = environmentSchema.safeParse(process.env);

if (!parseResult.success) {
  throw new Error(
    `Invalid environment configuration: ${JSON.stringify(parseResult.error.flatten().fieldErrors)}`,
  );
}

if (parseResult.data.KAFKA_BROKERS.length === 0) {
  throw new Error(
    "Invalid environment configuration: KAFKA_BROKERS cannot be empty.",
  );
}

export const env = parseResult.data;
