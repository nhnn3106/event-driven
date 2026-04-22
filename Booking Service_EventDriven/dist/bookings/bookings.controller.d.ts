import { Observable } from 'rxjs';
import { BookingsService, BookingView } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    create(createBookingDto: CreateBookingDto): Promise<BookingView>;
    findAll(userId?: string): Promise<BookingView[]>;
    streamEvents(): Observable<any>;
    getOccupiedSeats(movieId: string): Promise<string[]>;
    handlePaymentEvent(message: any): Promise<void>;
    updateStatus(id: string, status: 'CONFIRMED' | 'CANCELLED'): Promise<BookingView>;
}
