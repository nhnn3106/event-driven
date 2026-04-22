import { BookingEventsPublisher } from '../kafka/booking-events.publisher.interface';
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
export declare class BookingsService {
    private readonly prismaService;
    private readonly bookingEventsPublisher;
    private readonly bookingSubject;
    constructor(prismaService: PrismaService, bookingEventsPublisher: BookingEventsPublisher);
    getBookingEvents(): import("rxjs").Observable<any>;
    create(createBookingDto: CreateBookingDto): Promise<BookingView>;
    findAll(userId?: string): Promise<BookingView[]>;
    handlePaymentEvent(payload: any): Promise<void>;
    updateStatus(id: string, status: 'CONFIRMED' | 'CANCELLED'): Promise<BookingView>;
    getOccupiedSeats(movieId: string): Promise<string[]>;
}
