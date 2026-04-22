import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { randomUUID } from 'node:crypto';
import { firstValueFrom } from 'rxjs';
import { USER_EVENTS_CLIENT, USER_EVENTS_TOPIC } from './kafka.constants';
import {
  UserEventsPublisher,
  UserRegisteredEvent,
  UserRegisteredPayload,
} from './user-events.publisher.interface';

@Injectable()
export class KafkaUserEventsPublisher implements UserEventsPublisher {
  constructor(
    @Inject(USER_EVENTS_CLIENT) private readonly clientKafka: ClientKafka,
  ) {}

  async publishUserRegistered(payload: UserRegisteredPayload): Promise<void> {
    const event: UserRegisteredEvent = {
      eventId: randomUUID(),
      eventType: 'USER_REGISTERED',
      timestamp: new Date().toISOString(),
      payload,
    };

    await firstValueFrom(
      this.clientKafka.emit<UserRegisteredEvent>(USER_EVENTS_TOPIC, event),
    );
  }
}
