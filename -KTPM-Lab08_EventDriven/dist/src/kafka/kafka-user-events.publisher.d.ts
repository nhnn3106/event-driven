import { ClientKafka } from '@nestjs/microservices';
import { UserEventsPublisher, UserRegisteredPayload } from './user-events.publisher.interface';
export declare class KafkaUserEventsPublisher implements UserEventsPublisher {
    private readonly clientKafka;
    constructor(clientKafka: ClientKafka);
    publishUserRegistered(payload: UserRegisteredPayload): Promise<void>;
}
