import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

interface SurveyTask {
    id: number
    assignmentId: number
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
    role: 'SELF' | 'REVIEWER'
    createdAt: string
    assignment: {
        survey: {
            id: number
            title: string
            description: string | null
            endDate: string | null
        }
        participant: {
            id: number
            email: string
            firstName: string | null
            lastName: string | null
        }
    }
}

interface SurveysState {
    data: {
        self: SurveyTask[]
        reviews: SurveyTask[]
    }
    loading: boolean
    error: string | null
    lastFetched: number | null
}

const initialState: SurveysState = {
    data: {
        self: [],
        reviews: []
    },
    loading: false,
    error: null,
    lastFetched: null
}

export const fetchSurveys = createAsyncThunk(
    'surveys/fetchSurveys',
    async (_, { rejectWithValue }) => {
        try {
            const res = await fetch('/api/surveys')
            if (!res.ok) {
                if (res.status === 401) throw new Error('Unauthorized')
                throw new Error('Failed to fetch surveys')
            }
            const json = await res.json()
            return json.data
        } catch (error: any) {
            return rejectWithValue(error.message)
        }
    }
)

const surveysSlice = createSlice({
    name: 'surveys',
    initialState,
    reducers: {
        clearSurveys: (state) => {
            state.data = { self: [], reviews: [] }
            state.loading = false
            state.error = null
            state.lastFetched = null
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSurveys.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchSurveys.fulfilled, (state, action) => {
                state.loading = false
                state.data = action.payload
                state.lastFetched = Date.now()
            })
            .addCase(fetchSurveys.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
    }
})

export const { clearSurveys } = surveysSlice.actions

export const selectSurveys = (state: { surveys: SurveysState }) => state.surveys.data
export const selectSurveysLoading = (state: { surveys: SurveysState }) => state.surveys.loading
export const selectSurveysError = (state: { surveys: SurveysState }) => state.surveys.error
export const selectSurveysLastFetched = (state: { surveys: SurveysState }) => state.surveys.lastFetched

export default surveysSlice.reducer
