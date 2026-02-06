// Core type definitions for Redux store
export interface User {
    id: number
    email: string
    first_name?: string
    last_name?: string
    name?: string // Keep for backward compat if needed, or remove? API returns first_name/last_name. 
    // Let's keep it optional just in case.
    username?: string
    profile_picture?: string
    is_admin?: boolean
    is_staff?: boolean
    is_superuser?: boolean
}

export interface Course {
    id: number
    title: string
    description?: string
    cover_image?: string
    total_hours?: number
    lessons?: Lesson[]
    subjects?: {
        id: number
        name: string
    }[]
    enrollment_type?: string
    points?: number
    is_enrolled?: boolean
    rating?: number
    reviews_count?: number
    students_count?: number
    progress?: number
    // Additional fields for CoursesSection compatibility
    course_quizzes?: any[]
    estimated_hours?: number
    is_active?: boolean
    created_at?: string
    updated_at?: string
    duration_days?: number
    expiry_date?: string | null
    video?: any | null
}

export interface Lesson {
    id: number
    title: string
    description?: string
    estimated_hours?: number
    cover_image?: string // Added as it was used in replacement
    points?: number
    expiry_date?: string | null
    duration_days?: number
    created_at?: string
    updated_at?: string
    video?: any | null
    text?: any | null
    lesson_quizzes?: any[]
}

export interface CourseProgress {
    completedLessons: number[]
    passedQuizzes: number[]
    lastAccessedLesson: number | null
    progressPercentage: number
    updatedAt: string
}

export interface CompletedCourse {
    id: number
    title: string
    completedAt: string
    certificateId?: string
    totalHours: number
}

export interface Event {
    id: number
    title: string
    date: string
    description?: string
    participants?: Array<{ attended: boolean }>
}

export interface Certificate {
    id: string
    courseId: number
    courseName: string
    earnedAt: string
    downloadUrl?: string
}

// Store state interfaces
export interface AuthState {
    user: User | null
    accessToken: string | null
    isAuthenticated: boolean
    loading: boolean
    error: string | null
}

export interface CourseProgressState {
    progress: Record<number, CourseProgress>
}

export interface CompletedCoursesState {
    courses: CompletedCourse[]
}

export interface EventsState {
    events: Event[]
    registeredEvents: number[]
    attendedEvents: number[]
    loading: boolean
    error: string | null
}

export interface CertificatesState {
    certificates: Certificate[]
}

export interface RootState {
    auth: AuthState
    courseProgress: CourseProgressState
    completedCourses: CompletedCoursesState
    events: EventsState
    certificates: CertificatesState
}
