# Movie Service

Movie Service for the Movie Ticket System assignment.

## Stack

- Node.js + TypeScript + Express
- PostgreSQL (Prisma)
- Kafka (KafkaJS) for broker connectivity and health checks

## Features implemented

- `GET /api/movies` with pagination (`limit`, `offset`)
- `POST /api/movies` with payload validation
- `GET /health` for DB + Kafka status
- Structured request logging with request id
- Graceful shutdown (HTTP server + DB + Kafka)

## Environment

Copy `.env.example` to `.env` and update values if needed.

## Run

1. Install dependencies

```bash
npm install
```

2. Generate Prisma client

```bash
npm run prisma:generate
```

3. Apply migrations

```bash
npm run prisma:deploy
```

For local development migration flow:

```bash
npm run prisma:migrate
```

4. Optional seed data

```bash
npm run prisma:seed
```

5. Start service

```bash
npm run dev
```

## Build and test

```bash
npm run build
npm test
```

## API

### GET /api/movies

Query params:

- `limit` (default 20, max 100)
- `offset` (default 0)

Response:

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Interstellar",
      "description": "Explorers travel through a wormhole in space.",
      "durationMinutes": 169,
      "posterUrl": "https://example.com/interstellar.jpg",
      "createdAt": "2026-04-15T07:00:00.000Z"
    }
  ],
  "total": 1,
  "limit": 20,
  "offset": 0
}
```

### POST /api/movies

Request body:

```json
{
  "title": "Interstellar",
  "description": "Explorers travel through a wormhole in space.",
  "durationMinutes": 169,
  "posterUrl": "https://example.com/interstellar.jpg"
}
```

Response: `201 Created`

### GET /health

Sample response:

```json
{
  "status": "degraded",
  "service": "movie-service",
  "timestamp": "2026-04-15T07:00:00.000Z",
  "checks": {
    "database": {
      "status": "up"
    },
    "kafka": {
      "status": "down",
      "details": "Kafka not connected"
    }
  }
}
```

## LAN notes

- Default port is `8082`.
- Set host and port in `.env` for LAN deployment.
- Service does not call other services directly.
