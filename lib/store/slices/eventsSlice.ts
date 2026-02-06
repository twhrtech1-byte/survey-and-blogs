import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { EventsState, Event } from '../types'

// Async thunk
export const fetchEvents = createAsyncThunk(
    'events/fetchEvents',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch('/api/events')
            if (!response.ok) {
                throw new Error('Failed to fetch events')
            }
            const data = await response.json()
            return data.results || [] // Assuming API returns { results: [...] }
        } catch (error: any) {
            return rejectWithValue(error.message)
        }
    }
)

const initialState: EventsState = {
    events: [],
    registeredEvents: [],
    attendedEvents: [],
    loading: false,
    error: null
}

const eventsSlice = createSlice({
    name: 'events',
    initialState,
    reducers: {
        setEvents: (state, action: PayloadAction<Event[]>) => {
            state.events = action.payload
            state.loading = false
            state.error = null
        },
        registerForEvent: (state, action: PayloadAction<number>) => {
            if (!state.registeredEvents.includes(action.payload)) {
                state.registeredEvents.push(action.payload)
            }
        },
        markEventAttended: (state, action: PayloadAction<number>) => {
            if (!state.attendedEvents.includes(action.payload)) {
                state.attendedEvents.push(action.payload)
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload
        },
        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload
            state.loading = false
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchEvents.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchEvents.fulfilled, (state, action) => {
                state.loading = false
                state.events = action.payload
                // Optional: Derive attended/registered from payload if API provides it
            })
            .addCase(fetchEvents.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
    }
})

export const {
    setEvents,
    registerForEvent,
    markEventAttended,
    setLoading,
    setError
} = eventsSlice.actions

// Selectors
export const selectEvents = (state: { events: EventsState }) => state.events.events
export const selectRegisteredEvents = (state: { events: EventsState }) => state.events.registeredEvents
export const selectAttendedEvents = (state: { events: EventsState }) => state.events.attendedEvents
export const selectAttendedEventsCount = (state: { events: EventsState }) => state.events.attendedEvents.length

export default eventsSlice.reducer
