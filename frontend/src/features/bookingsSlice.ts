import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { BookingResponse, CreateBookingRequest } from '../../api'
import { BookingStatus } from '../../api'
import { loadFromStorage, saveToStorage } from '../utils/storage'

import { apiClient } from '../api/client'

export const fetchBookings = createAsyncThunk<BookingResponse[], string | undefined>('bookings/fetch', async (userId) => {
    const url = userId ? `/bookings?userId=${userId}` : '/bookings';
    return apiClient.booking.get(url)
})

export const createBooking = createAsyncThunk<BookingResponse, CreateBookingRequest>(
    'bookings/create',
    async (payload, { getState }) => {
        const state: any = getState();
        const token = state.auth.current?.accessToken;
        return apiClient.booking.post('/bookings', payload, token)
    },
)

export const updateBookingStatus = createAsyncThunk<BookingResponse, { id: string; status: BookingStatus }>(
    'bookings/updateStatus',
    async ({ id, status }, { getState }) => {
        const state: any = getState();
        const token = state.auth.current?.accessToken;
        return apiClient.booking.patch(`/bookings/${id}/status`, { status }, token)
    },
)

export const fetchOccupiedSeats = createAsyncThunk<string[], string>(
    'bookings/fetchOccupiedSeats',
    async (movieId) => {
        return apiClient.booking.getOccupiedSeats(movieId);
    }
)

type BookingsState = {
    items: BookingResponse[]
    occupiedSeats: string[] // List of seat numbers taken for current movie
    status: 'idle' | 'loading' | 'failed'
    error: string | null
}

const initialState: BookingsState = {
    items: [],
    occupiedSeats: [],
    status: 'idle',
    error: null,
}

const bookingsSlice = createSlice({
    name: 'bookings',
    initialState,
    reducers: {
        bookingAdded: (state, action) => {
            const existing = state.items.find(b => b.id === action.payload.id);
            if (!existing) {
                state.items = [action.payload, ...state.items];
            }
        },
        bookingUpdated: (state, action) => {
            const index = state.items.findIndex(b => b.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = action.payload;
            }
        },
        seatOccupied: (state, action: { payload: { movieId: string, seatNumber: string } }) => {
            if (!state.occupiedSeats.includes(action.payload.seatNumber)) {
                state.occupiedSeats.push(action.payload.seatNumber);
            }
        },
        seatReleased: (state, action: { payload: { movieId: string, seatNumber: string } }) => {
            state.occupiedSeats = state.occupiedSeats.filter(s => s !== action.payload.seatNumber);
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBookings.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(fetchBookings.fulfilled, (state, action) => {
                state.status = 'idle'
                state.items = action.payload
            })
            .addCase(fetchBookings.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message ?? 'Fetch bookings failed'
            })
            .addCase(createBooking.fulfilled, (state, action) => {
                state.items = [action.payload, ...state.items]
            })
            .addCase(updateBookingStatus.fulfilled, (state, action) => {
                const index = state.items.findIndex(b => b.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(fetchOccupiedSeats.fulfilled, (state, action) => {
                state.occupiedSeats = action.payload;
            })
    },
})

export const { bookingAdded, bookingUpdated, seatOccupied, seatReleased } = bookingsSlice.actions;
export default bookingsSlice.reducer
