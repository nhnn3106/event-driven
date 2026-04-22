import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { USER_EVENTS_PUBLISHER } from '../kafka/kafka.constants';
import {
  UserEventsPublisher,
  UserRegisteredPayload,
} from '../kafka/user-events.publisher.interface';
import { PublicUser, UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register-user.dto';

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(USER_EVENTS_PUBLISHER)
    private readonly userEventsPublisher: UserEventsPublisher,
  ) {}

  async register(registerUserDto: RegisterUserDto): Promise<PublicUser> {
    const email = registerUserDto.email.trim().toLowerCase();
    const fullName = registerUserDto.fullName.trim();

    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const createdUser = await this.usersService.createUser({
      email,
      password: registerUserDto.password,
      fullName,
    });

    const eventPayload: UserRegisteredPayload = {
      userId: createdUser.id,
      email: createdUser.email,
      fullName: createdUser.fullName || '',
    };
    await this.userEventsPublisher.publishUserRegistered(eventPayload);

    return this.usersService.toPublicUser(createdUser);
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const email = loginDto.email.trim().toLowerCase();

    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.usersService.isPasswordValid(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName || '',
        role: user.role,
      },
    };
  }
}
