import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // uses localStorage

import authReducer from './slices/authSlice'
import courseProgressReducer from './slices/courseProgressSlice'
import completedCoursesReducer from './slices/completedCoursesSlice'
import eventsReducer from './slices/eventsSlice'
import certificatesReducer from './slices/certificatesSlice'
import surveysReducer from './slices/surveysSlice'
import blogsReducer from './slices/blogsSlice'
import coursesReducer from './slices/coursesSlice'

// Configure persist
const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    // Blacklist auth for security (don't persist tokens in localStorage)
    blacklist: ['auth']
}

const rootReducer = combineReducers({
    auth: authReducer,
    courseProgress: courseProgressReducer,
    completedCourses: completedCoursesReducer,
    events: eventsReducer,
    certificates: certificatesReducer,
    surveys: surveysReducer,
    blogs: blogsReducer,
    courses: coursesReducer
})

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
    devTools: process.env.NODE_ENV !== 'production',
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
