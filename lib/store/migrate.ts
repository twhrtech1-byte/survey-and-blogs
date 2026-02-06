import { store } from './index'
import { initializeFromLocalStorage } from './slices/completedCoursesSlice'
import { initializeCourseProgress } from './slices/courseProgressSlice'
import type { CompletedCourse, CourseProgress } from './types'

/**
 * Migrate data from old localStorage keys to Redux store
 * This runs once on first app load
 */
export function migrateLocalStorageToRedux() {
    try {
        // Migrate completed courses
        const completedCoursesStr = localStorage.getItem('completedCourses')
        if (completedCoursesStr) {
            try {
                const completedCourses: CompletedCourse[] = JSON.parse(completedCoursesStr)
                // Validate and normalize data
                const normalizedCourses = completedCourses.map(course => ({
                    id: course.id,
                    title: course.title || 'Unknown Course',
                    completedAt: course.completedAt || new Date().toISOString(),
                    certificateId: course.certificateId,
                    totalHours: course.totalHours || 0
                }))
                store.dispatch(initializeFromLocalStorage(normalizedCourses))
                console.log('[Migration] Completed courses migrated successfully')
            } catch (e) {
                console.error('[Migration] Failed to migrate completed courses:', e)
            }
        }

        // Migrate course progress
        // Scan for all course_progress_* keys
        const progressData: Record<number, CourseProgress> = {}
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key?.startsWith('course_progress_')) {
                const courseId = parseInt(key.replace('course_progress_', ''))
                const progressStr = localStorage.getItem(key)
                if (progressStr) {
                    try {
                        const progress = JSON.parse(progressStr)
                        progressData[courseId] = {
                            completedLessons: Array.isArray(progress.completedLessons)
                                ? progress.completedLessons.map((id: any) => Number(id))
                                : [],
                            passedQuizzes: Array.isArray(progress.passedQuizzes)
                                ? progress.passedQuizzes.map((id: any) => Number(id))
                                : [],
                            lastAccessedLesson: progress.lastAccessedLesson || null,
                            progressPercentage: progress.progressPercentage || 0,
                            updatedAt: progress.updatedAt || new Date().toISOString()
                        }
                    } catch (e) {
                        console.error(`[Migration] Failed to migrate progress for course ${courseId}:`, e)
                    }
                }
            }
        }

        if (Object.keys(progressData).length > 0) {
            store.dispatch(initializeCourseProgress(progressData))
            console.log(`[Migration] Progress for ${Object.keys(progressData).length} courses migrated`)
        }

        console.log('[Migration] Migration complete')

        // Mark migration as complete
        localStorage.setItem('redux_migration_complete', 'true')

    } catch (error) {
        console.error('[Migration] Migration failed:', error)
    }
}

/**
 * Check if migration has already been done
 */
export function shouldRunMigration(): boolean {
    return localStorage.getItem('redux_migration_complete') !== 'true'
}
