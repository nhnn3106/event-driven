import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { USER_EVENTS_PUBLISHER } from '../kafka/kafka.constants';
import { UserEventsPublisher } from '../kafka/user-events.publisher.interface';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register-user.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let publishUserRegisteredSpy: jest.SpiedFunction<
    UserEventsPublisher['publishUserRegistered']
  >;

  const usersServiceMock = {
    findByEmail: jest.fn(),
    createUser: jest.fn(),
    isPasswordValid: jest.fn(),
    toPublicUser: jest.fn(),
  };

  const jwtServiceMock = {
    signAsync: jest.fn(),
  };

  const userEventsPublisherMock: UserEventsPublisher = {
    publishUserRegistered: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    publishUserRegisteredSpy = jest.spyOn(
      userEventsPublisherMock,
      'publishUserRegistered',
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
        {
          provide: USER_EVENTS_PUBLISHER,
          useValue: userEventsPublisherMock,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should register a user and publish USER_REGISTERED event', async () => {
    const registerDto: RegisterUserDto = {
      email: 'new.user@example.com',
      password: 'password123',
      fullName: 'New User',
    };

    const createdUser: User = {
      id: 'a5d2685e-9d4f-4d5c-aad7-1b64338f1473',
      email: 'new.user@example.com',
      passwordHash: 'hashed-password',
      fullName: 'New User',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    const publicUser = {
      id: createdUser.id,
      email: createdUser.email,
      fullName: createdUser.fullName,
      createdAt: createdUser.createdAt,
    };

    usersServiceMock.findByEmail.mockResolvedValue(null);
    usersServiceMock.createUser.mockResolvedValue(createdUser);
    usersServiceMock.toPublicUser.mockReturnValue(publicUser);
    publishUserRegisteredSpy.mockResolvedValue(undefined);

    const result = await authService.register(registerDto);

    expect(usersServiceMock.createUser).toHaveBeenCalledWith({
      email: 'new.user@example.com',
      password: 'password123',
      fullName: 'New User',
    });
    expect(publishUserRegisteredSpy).toHaveBeenCalledWith({
      userId: createdUser.id,
      email: createdUser.email,
      fullName: createdUser.fullName,
    });
    expect(result).toEqual(publicUser);
  });

  it('should throw conflict when registering with an existing email', async () => {
    const registerDto: RegisterUserDto = {
      email: 'existing.user@example.com',
      password: 'password123',
      fullName: 'Existing User',
    };

    usersServiceMock.findByEmail.mockResolvedValue({ id: 'user-id' });

    await expect(authService.register(registerDto)).rejects.toBeInstanceOf(
      ConflictException,
    );

    expect(usersServiceMock.createUser).not.toHaveBeenCalled();
    expect(publishUserRegisteredSpy).not.toHaveBeenCalled();
  });

  it('should throw unauthorized when login password is invalid', async () => {
    const loginDto: LoginDto = {
      email: 'user@example.com',
      password: 'wrong-password',
    };

    usersServiceMock.findByEmail.mockResolvedValue({
      id: 'user-id',
      email: 'user@example.com',
      passwordHash: 'hashed-password',
    });
    usersServiceMock.isPasswordValid.mockResolvedValue(false);

    await expect(authService.login(loginDto)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    expect(jwtServiceMock.signAsync).not.toHaveBeenCalled();
  });
});
