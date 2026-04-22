import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BOOKING_EVENTS_PUBLISHER } from '../kafka/kafka.constants';
import { BookingEventsPublisher } from '../kafka/booking-events.publisher.interface';
import { PrismaService } from '../prisma/prisma.service';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

describe('BookingsService', () => {
  let bookingsService: BookingsService;
  let publishBookingCreatedSpy: jest.SpiedFunction<
    BookingEventsPublisher['publishBookingCreated']
  >;

  const prismaServiceMock = {
    booking: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const bookingEventsPublisherMock: BookingEventsPublisher = {
    publishBookingCreated: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    publishBookingCreatedSpy = jest.spyOn(
      bookingEventsPublisherMock,
      'publishBookingCreated',
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: PrismaService,
          useValue: prismaServiceMock,
        },
        {
          provide: BOOKING_EVENTS_PUBLISHER,
          useValue: bookingEventsPublisherMock,
        },
      ],
    }).compile();

    bookingsService = module.get<BookingsService>(BookingsService);
  });

  it('creates a booking and publishes BOOKING_CREATED event', async () => {
    const createBookingDto: CreateBookingDto = {
      userId: '1096f4fc-b303-4769-aa9d-ac74caf31f87',
      movieId: 'fa9857f2-7082-4946-8bc8-9ec3ddf9f53f',
      seatNumber: 'A1',
      totalPrice: 150,
    };

    const createdBooking = {
      id: '5a78e3f8-c26f-4bcb-8ac3-ca3cf7fb322d',
      userId: createBookingDto.userId,
      movieId: createBookingDto.movieId,
      seatNumber: createBookingDto.seatNumber,
      totalPrice: createBookingDto.totalPrice,
      status: 'PENDING' as const,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    };

    prismaServiceMock.booking.create.mockResolvedValue(createdBooking);
    publishBookingCreatedSpy.mockResolvedValue(undefined);

    const result = await bookingsService.create(createBookingDto);

    expect(prismaServiceMock.booking.create).toHaveBeenCalledWith({
      data: {
        userId: createBookingDto.userId,
        movieId: createBookingDto.movieId,
        seatNumber: createBookingDto.seatNumber,
        totalPrice: createBookingDto.totalPrice,
      },
    });
    expect(publishBookingCreatedSpy).toHaveBeenCalledWith({
      bookingId: createdBooking.id,
      userId: createdBooking.userId,
      movieId: createdBooking.movieId,
      seatNumber: createdBooking.seatNumber,
      amount: createdBooking.totalPrice,
    });
    expect(result).toEqual({
      ...createdBooking,
      totalPrice: Number(createdBooking.totalPrice),
      createdAt: createdBooking.createdAt.toISOString(),
    });
  });
});
