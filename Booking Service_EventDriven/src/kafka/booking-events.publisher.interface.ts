export interface BookingCreatedPayload {
  bookingId: string;
  userId: string;
  movieId: string;
  seatNumber: string;
  amount: number;
}

export interface BookingCreatedEvent {
  eventId: string;
  eventType: 'BOOKING_CREATED';
  timestamp: string;
  payload: BookingCreatedPayload;
}

export interface BookingEventsPublisher {
  publishBookingCreated(payload: BookingCreatedPayload): Promise<void>;
}
