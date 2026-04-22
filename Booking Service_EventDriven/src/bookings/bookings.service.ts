import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { BOOKING_EVENTS_PUBLISHER } from '../kafka/kafka.constants';
import {
  BookingEventsPublisher,
  BookingCreatedPayload,
} from '../kafka/booking-events.publisher.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

export interface BookingView {
  id: string;
  userId: string;
  movieId: string;
  seatNumber: string;
  totalPrice: number;
  paymentMethod: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
}

@Injectable()
export class BookingsService {
  private readonly bookingSubject = new Subject<any>();

  constructor(
    private readonly prismaService: PrismaService,
    @Inject(BOOKING_EVENTS_PUBLISHER)
    private readonly bookingEventsPublisher: BookingEventsPublisher,
  ) {}

  getBookingEvents() {
    return this.bookingSubject.asObservable();
  }

  async create(createBookingDto: CreateBookingDto): Promise<BookingView> {
    const createdBooking = await this.prismaService.booking.create({
      data: {
        userId: createBookingDto.userId,
        movieId: createBookingDto.movieId,
        seatNumber: createBookingDto.seatNumber,
        totalPrice: createBookingDto.totalPrice,
        paymentMethod: createBookingDto.paymentMethod || 'COD',
      },
    });

    const payload: BookingCreatedPayload = {
      bookingId: createdBooking.id,
      userId: createdBooking.userId,
      movieId: createdBooking.movieId,
      seatNumber: createdBooking.seatNumber,
      amount: Number(createdBooking.totalPrice),
    };
    await this.bookingEventsPublisher.publishBookingCreated(payload);

    const returnData = {
      ...createdBooking,
      totalPrice: Number(createdBooking.totalPrice),
      createdAt: createdBooking.createdAt.toISOString(),
    };

    this.bookingSubject.next({ type: 'BOOKING_CREATED', data: returnData });

    return returnData;
  }

  async findAll(userId?: string): Promise<BookingView[]> {
    const where = userId ? { userId } : {};
    const bookings = await this.prismaService.booking.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
    return bookings.map(b => ({
      ...b,
      totalPrice: Number(b.totalPrice),
      createdAt: b.createdAt.toISOString(),
    }));
  }

  async handlePaymentEvent(payload: any): Promise<void> {
    const status = payload.status === 'SUCCESS' ? 'CONFIRMED' : 'CANCELLED';
    await this.updateStatus(payload.bookingId, status);
  }

  async updateStatus(id: string, status: 'CONFIRMED' | 'CANCELLED'): Promise<BookingView> {
    const updated = await this.prismaService.booking.update({
      where: { id },
      data: { status },
    });
    const returnData = {
      ...updated,
      totalPrice: Number(updated.totalPrice),
      createdAt: updated.createdAt.toISOString(),
    };

    this.bookingSubject.next({ type: 'BOOKING_UPDATED', data: returnData });

    return returnData;
  }

  async getOccupiedSeats(movieId: string): Promise<string[]> {
    const bookings = await this.prismaService.booking.findMany({
      where: {
        movieId,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      select: { seatNumber: true },
    });
    return bookings.map(b => b.seatNumber);
  }
}
