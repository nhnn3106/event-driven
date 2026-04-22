import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { CreateMovieRequest, MovieDto } from '../../api'
import { loadFromStorage, saveToStorage } from '../utils/storage'

import { apiClient } from '../api/client'

export const fetchMovies = createAsyncThunk<MovieDto[]>('movies/fetch', async () => {
    return apiClient.movie.get('/movies')
})

export const createMovie = createAsyncThunk<MovieDto, CreateMovieRequest>(
    'movies/create',
    async (payload, { getState }) => {
        const state: any = getState();
        const token = state.auth.current?.accessToken;
        return apiClient.movie.post('/movies', payload, token)
    },
)

export const updateMovie = createAsyncThunk<MovieDto, { id: string; data: Partial<CreateMovieRequest> }>(
    'movies/update',
    async ({ id, data }, { getState }) => {
        const state: any = getState();
        const token = state.auth.current?.accessToken;
        return apiClient.movie.patch(id, data, token)
    },
)

export const deleteMovie = createAsyncThunk<string, string>(
    'movies/delete',
    async (id, { getState }) => {
        const state: any = getState();
        const token = state.auth.current?.accessToken;
        await apiClient.movie.delete(id, token)
        return id;
    },
)


type MoviesState = {
    items: MovieDto[]
    status: 'idle' | 'loading' | 'failed'
    error: string | null
}

const initialState: MoviesState = {
    items: [],
    status: 'idle',
    error: null,
}

const moviesSlice = createSlice({
    name: 'movies',
    initialState,
    reducers: {
        movieAdded: (state, action) => {
            if (Array.isArray(state.items)) {
                const existing = state.items.find(m => m.id === action.payload.id);
                if (!existing) {
                    state.items = [action.payload, ...state.items];
                }
            }
        },
        movieUpdated: (state, action) => {
            if (Array.isArray(state.items)) {
                const index = state.items.findIndex(m => m.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            }
        },
        movieDeleted: (state, action) => {
            if (Array.isArray(state.items)) {
                state.items = state.items.filter(m => m.id !== action.payload.id);
            }
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMovies.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(fetchMovies.fulfilled, (state, action) => {
                state.status = 'idle'
                state.items = action.payload
            })
            .addCase(fetchMovies.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message ?? 'Fetch movies failed'
            })
            .addCase(createMovie.fulfilled, (state, action) => {
                if (Array.isArray(state.items)) {
                    state.items = [action.payload, ...state.items]
                } else {
                    state.items = [action.payload]
                }
            })
            .addCase(updateMovie.fulfilled, (state, action) => {
                if (Array.isArray(state.items)) {
                    state.items = state.items.map(m => m.id === action.payload.id ? action.payload : m)
                }
            })
            .addCase(deleteMovie.fulfilled, (state, action) => {
                if (Array.isArray(state.items)) {
                    state.items = state.items.filter(m => m.id !== action.payload)
                }
            })
    },
})

export const { movieAdded, movieUpdated, movieDeleted } = moviesSlice.actions
export default moviesSlice.reducer
