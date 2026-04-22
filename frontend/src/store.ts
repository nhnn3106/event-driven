import { configureStore } from '@reduxjs/toolkit'
import authReducer from './features/authSlice'
import moviesReducer from './features/moviesSlice'
import bookingsReducer from './features/bookingsSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        movies: moviesReducer,
        bookings: bookingsReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
