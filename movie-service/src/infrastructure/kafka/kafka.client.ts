import { Admin, Kafka, logLevel } from "kafkajs";

import { env } from "../../config/env";
import { logger } from "../../lib/logger";

export type KafkaHealthState = "up" | "down";

export interface KafkaHealth {
  status: KafkaHealthState;
  details?: string;
}

class KafkaConnection {
  private readonly kafka: Kafka;
  private admin: Admin | null;
  private connected: boolean;

  constructor() {
    this.kafka = new Kafka({
      clientId: env.KAFKA_CLIENT_ID,
      brokers: env.KAFKA_BROKERS,
      logLevel: logLevel.NOTHING,
    });
    this.admin = null;
    this.connected = false;
  }

  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    const admin = this.kafka.admin();

    try {
      await admin.connect();
      this.admin = admin;
      this.connected = true;
      logger.info({ brokers: env.KAFKA_BROKERS }, "Kafka broker connected.");
    } catch (error) {
      this.admin = null;
      this.connected = false;
      const message =
        error instanceof Error ? error.message : "Unknown Kafka error";
      logger.warn(
        { error: message, brokers: env.KAFKA_BROKERS },
        "Kafka broker unavailable, running in degraded mode.",
      );
    }
  }

  async disconnect(): Promise<void> {
    if (!this.admin) {
      return;
    }

    try {
      await this.admin.disconnect();
      logger.info("Kafka admin disconnected.");
    } finally {
      this.admin = null;
      this.connected = false;
    }
  }

  async health(): Promise<KafkaHealth> {
    if (!this.admin || !this.connected) {
      return {
        status: "down",
        details: "Kafka not connected",
      };
    }

    try {
      await this.admin.listTopics();
      return { status: "up" };
    } catch (error) {
      this.connected = false;
      const message =
        error instanceof Error ? error.message : "Unknown Kafka error";
      return {
        status: "down",
        details: message,
      };
    }
  }
}

export const kafkaConnection = new KafkaConnection();
