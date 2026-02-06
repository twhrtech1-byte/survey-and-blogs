import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import type { AuthState, User } from '../types'

const initialState: AuthState = {
    user: null,
    accessToken: null,
    isAuthenticated: false,
    loading: false,
    error: null
}

export const fetchUserMe = createAsyncThunk(
    'auth/fetchUserMe',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/me')
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized')
                }
                throw new Error('Failed to fetch user profile')
            }
            const user = await response.json()
            return user
        } catch (error: any) {
            return rejectWithValue(error.message)
        }
    }
)

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Set authentication token
        setToken: (state, action: PayloadAction<string>) => {
            state.accessToken = action.payload
            state.isAuthenticated = true
            state.error = null
        },

        // Set user data
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload
            state.isAuthenticated = true
            state.error = null
        },

        // Login action
        loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
            state.user = action.payload.user
            state.accessToken = action.payload.token
            state.isAuthenticated = true
            state.loading = false
            state.error = null
        },

        // Logout action
        logout: (state) => {
            state.user = null
            state.accessToken = null
            state.isAuthenticated = false
            state.loading = false
            state.error = null
        },

        // Set loading state
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload
        },

        // Set error
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload
            state.loading = false
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserMe.pending, (state) => {
                // If we already have a token/user, maybe don't set global loading? 
                // But this is meant to be a background check or initial check.
                // We'll set loading just in case.
                state.loading = true
                state.error = null
            })
            .addCase(fetchUserMe.fulfilled, (state, action) => {
                state.user = action.payload
                // If we successfully fetched 'me', we are authenticated
                state.isAuthenticated = true
                state.loading = false
                state.error = null
            })
            .addCase(fetchUserMe.rejected, (state, action) => {
                state.loading = false
                // If 401, we might want to logout?
                if (action.payload === 'Unauthorized') {
                    state.user = null
                    state.isAuthenticated = false
                    state.accessToken = null
                }
                state.error = action.payload as string
            })
    }
})

export const {
    setToken,
    setUser,
    loginSuccess,
    logout,
    setLoading,
    setError
} = authSlice.actions

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth
export const selectUser = (state: { auth: AuthState }) => state.auth.user
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading

export default authSlice.reducer
