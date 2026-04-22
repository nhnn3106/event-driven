import { ClientKafka } from '@nestjs/microservices';
import { BookingCreatedPayload, BookingEventsPublisher } from './booking-events.publisher.interface';
export declare class KafkaBookingEventsPublisher implements BookingEventsPublisher {
    private readonly clientKafka;
    constructor(clientKafka: ClientKafka);
    publishBookingCreated(payload: BookingCreatedPayload): Promise<void>;
}
