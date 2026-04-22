# Notification Service (Spring Boot)

Notification service for the Event-Driven Movie Ticket system.

## Responsibilities

- Consume `PAYMENT_COMPLETED` from `payment-events`
- Output notification logs for successful bookings
- Provide simple health endpoint

## API

- `GET /notifications/health`

## Run

1. Start Kafka broker (see shared compose in workspace root)
2. Run service:

```bash
mvn spring-boot:run
```

## Environment

Use `.env` values and pass them to runtime (IDE run config or shell export).
