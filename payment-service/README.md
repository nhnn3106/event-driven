# Payment Service (Spring Boot)

Payment service for the Event-Driven Movie Ticket system.

## Responsibilities

- Consume `BOOKING_CREATED` events from `booking-events`
- Simulate payment success/fail (random)
- Publish `PAYMENT_COMPLETED` or `BOOKING_FAILED` to `payment-events`
- Provide REST endpoints via `RestController`

## API

- `GET /payments/health`
- `POST /payments` (manual trigger for demo)

## Run

1. Start Kafka broker (see shared compose in workspace root)
2. Run service:

```bash
mvn spring-boot:run
```

## Environment

Use `.env` values and pass them to runtime (IDE run config or shell export).
