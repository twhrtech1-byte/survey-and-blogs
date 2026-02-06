import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { CourseProgressState, CourseProgress } from '../types'

const initialState: CourseProgressState = {
    progress: {}
}

const courseProgressSlice = createSlice({
    name: 'courseProgress',
    initialState,
    reducers: {
        // Mark a lesson as completed
        markLessonComplete: (state, action: PayloadAction<{ courseId: number; lessonId: number }>) => {
            const { courseId, lessonId } = action.payload

            if (!state.progress[courseId]) {
                state.progress[courseId] = {
                    completedLessons: [],
                    passedQuizzes: [],
                    lastAccessedLesson: null,
                    progressPercentage: 0,
                    updatedAt: new Date().toISOString()
                }
            }

            if (!state.progress[courseId].completedLessons.includes(lessonId)) {
                state.progress[courseId].completedLessons.push(lessonId)
                state.progress[courseId].updatedAt = new Date().toISOString()
            }
        },

        // Mark a quiz as passed
        markQuizPassed: (state, action: PayloadAction<{ courseId: number; quizId: number }>) => {
            const { courseId, quizId } = action.payload

            if (!state.progress[courseId]) {
                state.progress[courseId] = {
                    completedLessons: [],
                    passedQuizzes: [],
                    lastAccessedLesson: null,
                    progressPercentage: 0,
                    updatedAt: new Date().toISOString()
                }
            }

            if (!state.progress[courseId].passedQuizzes.includes(quizId)) {
                state.progress[courseId].passedQuizzes.push(quizId)
                state.progress[courseId].updatedAt = new Date().toISOString()
            }
        },

        // Update progress percentage
        updateProgressPercentage: (state, action: PayloadAction<{ courseId: number; percentage: number }>) => {
            const { courseId, percentage } = action.payload
            if (state.progress[courseId]) {
                state.progress[courseId].progressPercentage = Math.min(100, percentage)
                state.progress[courseId].updatedAt = new Date().toISOString()
            }
        },

        // Reset course progress (on max quiz attempts exceeded)
        resetCourseProgress: (state, action: PayloadAction<number>) => {
            const courseId = action.payload
            if (state.progress[courseId]) {
                state.progress[courseId] = {
                    completedLessons: [],
                    passedQuizzes: [],
                    lastAccessedLesson: null,
                    progressPercentage: 0,
                    updatedAt: new Date().toISOString()
                }
            }
        },

        // Initialize from localStorage (migration helper)
        initializeCourseProgress: (state, action: PayloadAction<Record<number, CourseProgress>>) => {
            state.progress = action.payload
        },

        // Set last accessed lesson
        setLastAccessedLesson: (state, action: PayloadAction<{ courseId: number; lessonId: number }>) => {
            const { courseId, lessonId } = action.payload
            if (state.progress[courseId]) {
                state.progress[courseId].lastAccessedLesson = lessonId
            }
        }
    }
})

export const {
    markLessonComplete,
    markQuizPassed,
    updateProgressPercentage,
    resetCourseProgress,
    initializeCourseProgress,
    setLastAccessedLesson
} = courseProgressSlice.actions

// Selectors
export const selectCourseProgress = (courseId: number) =>
    (state: { courseProgress: CourseProgressState }) =>
        state.courseProgress.progress[courseId]

export const selectCompletedLessons = (courseId: number) =>
    (state: { courseProgress: CourseProgressState }) =>
        state.courseProgress.progress[courseId]?.completedLessons || []

export const selectPassedQuizzes = (courseId: number) =>
    (state: { courseProgress: CourseProgressState }) =>
        state.courseProgress.progress[courseId]?.passedQuizzes || []

export const selectProgressPercentage = (courseId: number) =>
    (state: { courseProgress: CourseProgressState }) =>
        state.courseProgress.progress[courseId]?.progressPercentage || 0

export const selectAllCourseProgress = (state: { courseProgress: CourseProgressState }) =>
    state.courseProgress.progress

export default courseProgressSlice.reducer
