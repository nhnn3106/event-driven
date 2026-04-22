import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  BOOKING_EVENTS_CLIENT,
  BOOKING_EVENTS_PUBLISHER,
} from './kafka.constants';
import { KafkaBookingEventsPublisher } from './kafka-booking-events.publisher';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: BOOKING_EVENTS_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'booking-service',
              brokers: [
                configService.get<string>('KAFKA_BROKER') ??
                  'localhost:9092',
              ],
            },
          },
        }),
      },
    ]),
  ],
  providers: [
    {
      provide: BOOKING_EVENTS_PUBLISHER,
      useClass: KafkaBookingEventsPublisher,
    },
  ],
  exports: [BOOKING_EVENTS_PUBLISHER],
})
export class KafkaModule {}
