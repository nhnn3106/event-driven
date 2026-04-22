import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { USER_EVENTS_CLIENT, USER_EVENTS_PUBLISHER } from './kafka.constants';
import { KafkaUserEventsPublisher } from './kafka-user-events.publisher';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: USER_EVENTS_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'user-service',
              brokers: [
                configService.get<string>('KAFKA_BROKER') ??
                  '172.16.51.150:9092',
              ],
            },
          },
        }),
      },
    ]),
  ],
  providers: [
    {
      provide: USER_EVENTS_PUBLISHER,
      useClass: KafkaUserEventsPublisher,
    },
  ],
  exports: [USER_EVENTS_PUBLISHER],
})
export class KafkaModule {}
