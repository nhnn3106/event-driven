import { Body, Controller, Get, Patch, Param, Post, Query, Sse, ParseUUIDPipe } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { Observable, map } from 'rxjs';
import { BookingsService, BookingView } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() createBookingDto: CreateBookingDto): Promise<BookingView> {
    return this.bookingsService.create(createBookingDto);
  }

  @Get()
  findAll(@Query('userId') userId?: string): Promise<BookingView[]> {
    return this.bookingsService.findAll(userId);
  }

  @Sse('stream')
  streamEvents(): Observable<any> {
    return this.bookingsService.getBookingEvents().pipe(
      map((payload) => ({
        data: payload,
      })),
    );
  }

  @Get('occupied-seats/:movieId')
  getOccupiedSeats(@Param('movieId', ParseUUIDPipe) movieId: string) {
    return this.bookingsService.getOccupiedSeats(movieId);
  }

  @EventPattern('payment-events')
  async handlePaymentEvent(@Payload() message: any) {
    if (message.eventType === 'PAYMENT_COMPLETED' || message.eventType === 'BOOKING_FAILED') {
      await this.bookingsService.handlePaymentEvent(message.payload);
    }
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'CONFIRMED' | 'CANCELLED'
  ): Promise<BookingView> {
    return this.bookingsService.updateStatus(id, status);
  }
}
