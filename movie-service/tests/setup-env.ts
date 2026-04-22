process.env.NODE_ENV = "test";
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/movie_service_test";
process.env.KAFKA_BROKERS = process.env.KAFKA_BROKERS || "localhost:9092";
process.env.KAFKA_CLIENT_ID =
  process.env.KAFKA_CLIENT_ID || "movie-service-test";
process.env.KAFKA_REQUIRED = "false";
process.env.PORT = "8082";
process.env.SERVICE_HOST = "127.0.0.1";
