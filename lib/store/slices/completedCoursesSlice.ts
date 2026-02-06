import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { CompletedCoursesState, CompletedCourse } from '../types'

// Initial state - will sync with localStorage on first load
const initialState: CompletedCoursesState = {
    courses: []
}

const completedCoursesSlice = createSlice({
    name: 'completedCourses',
    initialState,
    reducers: {
        // Add a completed course
        addCompletedCourse: (state, action: PayloadAction<CompletedCourse>) => {
            const exists = state.courses.find(c => c.id === action.payload.id)
            if (!exists) {
                state.courses.push(action.payload)
            }
        },

        // Initialize from localStorage (migration helper)
        initializeFromLocalStorage: (state, action: PayloadAction<CompletedCourse[]>) => {
            state.courses = action.payload
        },

        // Clear all completed courses
        clearCompletedCourses: (state) => {
            state.courses = []
        }
    }
})

export const {
    addCompletedCourse,
    initializeFromLocalStorage,
    clearCompletedCourses
} = completedCoursesSlice.actions

// Selectors
export const selectCompletedCourses = (state: { completedCourses: CompletedCoursesState }) =>
    state.completedCourses.courses

export const selectCompletedCoursesCount = (state: { completedCourses: CompletedCoursesState }) =>
    state.completedCourses.courses.length

export const selectTotalLearningHours = (state: { completedCourses: CompletedCoursesState }) =>
    state.completedCourses.courses.reduce((total, course) => total + (course.totalHours || 0), 0)

export const selectIsCourseCompleted = (courseId: number) =>
    (state: { completedCourses: CompletedCoursesState }) =>
        state.completedCourses.courses.some(c => c.id === courseId)

export default completedCoursesSlice.reducer
