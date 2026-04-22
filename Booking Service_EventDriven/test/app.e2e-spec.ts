import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { BookingsController } from '../src/bookings/bookings.controller';
import { BookingsService } from '../src/bookings/bookings.service';

describe('Bookings endpoints (e2e)', () => {
  let app: INestApplication<App>;
  const bookingsServiceMock = {
    create: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        {
          provide: BookingsService,
          useValue: bookingsServiceMock,
        },
      ],
    })
      .overrideProvider(BookingsService)
      .useValue(bookingsServiceMock)
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

  it('POST /api/bookings returns created booking', () => {
    const payload = {
      id: 'bf819478-4a4d-4d69-8138-9c8d3e141f09',
      userId: '1096f4fc-b303-4769-aa9d-ac74caf31f87',
      roomId: 'fa9857f2-7082-4946-8bc8-9ec3ddf9f53f',
      startTime: '2026-05-01T10:00:00.000Z',
      endTime: '2026-05-01T11:00:00.000Z',
      status: 'PENDING',
      createdAt: '2026-01-01T00:00:00.000Z',
    };
    bookingsServiceMock.create.mockResolvedValue(payload);

    return request(app.getHttpServer())
      .post('/api/bookings')
      .send({
        userId: '1096f4fc-b303-4769-aa9d-ac74caf31f87',
        roomId: 'fa9857f2-7082-4946-8bc8-9ec3ddf9f53f',
        startTime: '2026-05-01T10:00:00.000Z',
        endTime: '2026-05-01T11:00:00.000Z',
      })
      .expect(201)
      .expect(payload);
  });

  it('GET /api/bookings returns all bookings', () => {
    const payload = [
      {
        id: 'bf819478-4a4d-4d69-8138-9c8d3e141f09',
        userId: '1096f4fc-b303-4769-aa9d-ac74caf31f87',
        roomId: 'fa9857f2-7082-4946-8bc8-9ec3ddf9f53f',
        startTime: '2026-05-01T10:00:00.000Z',
        endTime: '2026-05-01T11:00:00.000Z',
        status: 'PENDING',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ];
    bookingsServiceMock.findAll.mockResolvedValue(payload);

    return request(app.getHttpServer())
      .get('/api/bookings')
      .expect(200)
      .expect(payload);
  });

  it('POST /api/bookings returns 400 for invalid request body', () => {
    return request(app.getHttpServer())
      .post('/api/bookings')
      .send({
        userId: 'invalid-uuid',
        roomId: 'fa9857f2-7082-4946-8bc8-9ec3ddf9f53f',
        startTime: 'invalid-date',
      })
      .expect(400);
  });
});
