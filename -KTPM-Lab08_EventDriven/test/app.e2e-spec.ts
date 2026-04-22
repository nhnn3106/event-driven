import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';

describe('Users endpoints (e2e)', () => {
  let app: INestApplication<App>;
  const authServiceMock = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    })
      .overrideProvider(AuthService)
      .useValue(authServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });

  it('POST /api/users/register returns created user without password', () => {
    const payload = {
      id: '1096f4fc-b303-4769-aa9d-ac74caf31f87',
      email: 'user@example.com',
      fullName: 'Test User',
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    authServiceMock.register.mockResolvedValue(payload);

    return request(app.getHttpServer())
      .post('/api/users/register')
      .send({
        email: 'user@example.com',
        password: 'password123',
        fullName: 'Test User',
      })
      .expect(201)
      .expect(payload);
  });

  it('POST /api/users/login returns access token', () => {
    authServiceMock.login.mockResolvedValue({ accessToken: 'mock-jwt-token' });

    return request(app.getHttpServer())
      .post('/api/users/login')
      .send({
        email: 'user@example.com',
        password: 'password123',
      })
      .expect(201)
      .expect({ accessToken: 'mock-jwt-token' });
  });

  it('POST /api/users/register returns 400 for invalid request body', () => {
    return request(app.getHttpServer())
      .post('/api/users/register')
      .send({
        email: 'not-an-email',
        password: '123',
      })
      .expect(400);
  });
});
