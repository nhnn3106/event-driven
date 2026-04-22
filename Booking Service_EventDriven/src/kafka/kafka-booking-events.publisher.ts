import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'node:crypto';
import { firstValueFrom } from 'rxjs';
import { BOOKING_EVENTS_CLIENT, BOOKING_EVENTS_TOPIC } from './kafka.constants';
import {
  BookingCreatedEvent,
  BookingCreatedPayload,
  BookingEventsPublisher,
} from './booking-events.publisher.interface';

@Injectable()
export class KafkaBookingEventsPublisher implements BookingEventsPublisher {
  constructor(
    @Inject(BOOKING_EVENTS_CLIENT) private readonly clientKafka: ClientKafka,
  ) {}

  async publishBookingCreated(payload: BookingCreatedPayload): Promise<void> {
    const event: BookingCreatedEvent = {
      eventId: randomUUID(),
      eventType: 'BOOKING_CREATED',
      timestamp: new Date().toISOString(),
      payload,
    };

    await firstValueFrom(
      this.clientKafka.emit<BookingCreatedEvent>(BOOKING_EVENTS_TOPIC, event),
    );
  }
}
