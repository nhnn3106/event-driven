import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { KafkaModule } from '../kafka/kafka.module';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

function parseJwtExpiryToSeconds(value: string): number {
  const normalized = value.trim().toLowerCase();
  const match = /^(\d+)([smhd]?)$/.exec(normalized);

  if (!match) {
    return 900;
  }

  const amount = Number(match[1]);
  const unit = match[2] || 's';

  if (unit === 'm') {
    return amount * 60;
  }

  if (unit === 'h') {
    return amount * 60 * 60;
  }

  if (unit === 'd') {
    return amount * 60 * 60 * 24;
  }

  return amount;
}

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    KafkaModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const jwtSecret =
          configService.get<string>('JWT_SECRET') ?? 'change-this-secret';
        const jwtExpiresInRaw =
          configService.get<string>('JWT_EXPIRES_IN') ?? '15m';
        const jwtExpiresInSeconds = parseJwtExpiryToSeconds(jwtExpiresInRaw);

        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: jwtExpiresInSeconds,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
