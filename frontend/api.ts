export enum BookingStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
}

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
    role: string;
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
        role: string;
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
    paymentMethod?: string;
}

// Response chung cho 1 Booking
export interface BookingResponse {
    id: string; // UUID
    userId: string;
    movieId: string;
    seatNumber: string;
    totalPrice: number;
    paymentMethod: string;
    status: BookingStatus; // Mặc định là PENDING khi vừa tạo
    createdAt: string; // ISO Date string
}

// GET /api/bookings
export type GetBookingsResponse = BookingResponse[];