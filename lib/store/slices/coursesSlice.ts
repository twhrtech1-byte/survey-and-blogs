import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { RootState } from '../index'
import { Course } from '../types'

interface CoursesState {
    courses: Course[]
    allocatedCourseIds: number[]
    loading: boolean
    error: string | null
    lastFetched: number | null
}

const initialState: CoursesState = {
    courses: [],
    allocatedCourseIds: [],
    loading: false,
    error: null,
    lastFetched: null
}

export const fetchCourses = createAsyncThunk(
    'courses/fetchCourses',
    async (_, { rejectWithValue }) => {
        try {
            // Using /api/courses-subjects as it seems to provide the most detailed list for catalogue
            const response = await fetch('/api/courses-subjects')
            if (!response.ok) {
                throw new Error('Failed to fetch courses')
            }
            const data = await response.json()
            return data as Course[]
        } catch (error: any) {
            return rejectWithValue(error.message)
        }
    }
)

export const fetchAllocations = createAsyncThunk(
    'courses/fetchAllocations',
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState() as RootState
            const userId = state.auth.user?.id

            if (!userId) {
                // If no user logic, can't determine allocations. 
                // Maybe return empty or throw? 
                // If not logged in, allocations are 0.
                return []
            }

            const response = await fetch('/api/groups')
            if (!response.ok) {
                throw new Error('Failed to fetch groups for allocations')
            }
            const result = await response.json()
            const groups = result.data || []

            const allocations: number[] = []
            groups.forEach((group: any) => {
                const isMember = group.users.some((u: any) => u.id === userId)
                if (isMember) {
                    group.course_allocations.forEach((alloc: any) => {
                        allocations.push(alloc.course_id)
                    })
                }
            })

            return Array.from(new Set(allocations))
        } catch (error: any) {
            return rejectWithValue(error.message)
        }
    }
)

const coursesSlice = createSlice({
    name: 'courses',
    initialState,
    reducers: {
        clearCourses: (state) => {
            state.courses = []
            state.allocatedCourseIds = []
            state.lastFetched = null
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCourses.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchCourses.fulfilled, (state, action) => {
                state.loading = false
                state.courses = action.payload
                state.lastFetched = Date.now()
            })
            .addCase(fetchCourses.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })
            // Allocations
            .addCase(fetchAllocations.fulfilled, (state, action) => {
                state.allocatedCourseIds = action.payload
            })
    }
})

export const { clearCourses } = coursesSlice.actions

export const selectCourses = (state: RootState) => state.courses.courses
export const selectAllocatedCourseIds = (state: RootState) => state.courses.allocatedCourseIds
export const selectCoursesLoading = (state: RootState) => state.courses.loading

export default coursesSlice.reducer
