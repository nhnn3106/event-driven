Nhân-FE: 172.16.51.158
Thịnh-Payment + Notification: 172.16.51.168
Phát-User Service: 172.16.51.150
Tín-Booking Service: 172.16.51.129
Huy-Movie Service: 172.16.51.174

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE movies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INT,
    poster_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,     -- Tham chiếu ID từ User Service
    movie_id UUID NOT NULL,    -- Tham chiếu ID từ Movie Service
    seat_number VARCHAR(10) NOT NULL,
    total_price DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, CONFIRMED, CANCELLED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL,  -- Tham chiếu ID từ Booking Service
    amount DECIMAL(10, 2),
    payment_method VARCHAR(50),
    status VARCHAR(20),       -- SUCCESS, FAILED
    transaction_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
// POST /api/users/register
export interface RegisterRequest {
  email: string;
  password: string; // Sẽ được hash tại backend
  fullName: string;
}

export interface RegisterResponse {
  id: string; // UUID
  email: string;
  fullName: string;
}

// POST /api/users/login
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string; // JWT Token
  user: {
    id: string;
    email: string;
    fullName: string;
  };
}
export interface MovieDto {
  id: string; // UUID
  title: string;
  description: string;
  durationMinutes: number;
  posterUrl: string;
}

// GET /api/movies
export type GetMoviesResponse = MovieDto[];

// POST /api/movies
export type CreateMovieRequest = Omit<MovieDto, 'id'>;
// POST /api/bookings
export interface CreateBookingRequest {
  userId: string;
  movieId: string;
  seatNumber: string;
  totalPrice: number;
}

// Response chung cho 1 Booking
export interface BookingResponse {
  id: string; // UUID
  userId: string;
  movieId: string;
  seatNumber: string;
  totalPrice: number;
  status: BookingStatus; // Mặc định là PENDING khi vừa tạo
  createdAt: string; // ISO Date string
}

// GET /api/bookings
export type GetBookingsResponse = BookingResponse[];
// --- 1. BASE EVENT WRAPPER ---
export interface BaseEvent<T> {
  eventId: string;       // UUID cho mỗi log message
  eventType: string;     // Tên event (VD: 'BOOKING_CREATED')
  timestamp: string;     // Thời điểm bắn event
  payload: T;            // Dữ liệu lõi
}

// --- 2. USER EVENTS ---
// Topic: user-events
export interface UserRegisteredPayload {
  userId: string;
  email: string;
  fullName: string;
}
export type UserRegisteredEvent = BaseEvent<UserRegisteredPayload>;


// --- 3. BOOKING EVENTS ---
// Topic: booking-events
export interface BookingCreatedPayload {
  bookingId: string;
  userId: string;
  movieId: string;
  seatNumber: string;
  amount: number;
}
export type BookingCreatedEvent = BaseEvent<BookingCreatedPayload>;


// --- 4. PAYMENT/NOTIFICATION EVENTS ---
// Topic: payment-events
export interface PaymentResultPayload {
  bookingId: string;
  transactionId: string;
  amount: number;
  status: PaymentStatus; 
  reason?: string; // Dùng khi thất bại (VD: "Số dư không đủ")
}

// Event khi Payment xử lý thành công
export type PaymentCompletedEvent = BaseEvent<PaymentResultPayload>;

// Event khi Payment xử lý thất bại (Dùng để Booking Service trigger rollback)
export type BookingFailedEvent = BaseEvent<PaymentResultPayload>;

// Cấu hình trên NestJS khi có 3 máy Kafka
client: {
  clientId: 'messaging-backend',
  brokers: [
    'IP_MAY_KAFKA_1:9093', 
    'IP_MAY_KAFKA_2:9093', 
    'IP_MAY_KAFKA_3:9093'
  ],
}