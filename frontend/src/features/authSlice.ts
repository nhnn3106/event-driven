import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse } from '../../api'
import { loadFromStorage, saveToStorage } from '../utils/storage'

const USERS_KEY = 'ed_users'
const AUTH_KEY = 'ed_auth'

type StoredUser = RegisterResponse & { password: string }

function loadAuth() {
    return loadFromStorage<LoginResponse | null>(AUTH_KEY, null)
}

function saveAuth(auth: LoginResponse | null) {
    saveToStorage(AUTH_KEY, auth)
}

import { apiClient } from '../api/client'

export const registerUser = createAsyncThunk<RegisterResponse, RegisterRequest>(
    'auth/register',
    async (payload) => {
        const response = await apiClient.user.post('/users/register', payload);
        if (response.error || response.message === 'Conflict') {
            throw new Error(response.message || 'Register failed');
        }
        return response;
    },
)

export const loginUser = createAsyncThunk<LoginResponse, LoginRequest>(
    'auth/login',
    async (payload) => {
        const response = await apiClient.user.post('/users/login', payload);
        if (response.statusCode === 401 || !response.accessToken) {
            throw new Error(response.message || 'Invalid email or password');
        }
        saveAuth(response)
        return response
    },
)

type AuthState = {
    current: LoginResponse | null
    status: 'idle' | 'loading' | 'failed'
    error: string | null
}

const initialState: AuthState = {
    current: loadAuth(),
    status: 'idle',
    error: null,
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout(state) {
            state.current = null
            saveAuth(null)
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(registerUser.fulfilled, (state) => {
                state.status = 'idle'
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message ?? 'Register failed'
            })
            .addCase(loginUser.pending, (state) => {
                state.status = 'loading'
                state.error = null
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.status = 'idle'
                state.current = action.payload
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = 'failed'
                state.error = action.error.message ?? 'Login failed'
            })
    },
})

export const { logout } = authSlice.actions
export default authSlice.reducer
