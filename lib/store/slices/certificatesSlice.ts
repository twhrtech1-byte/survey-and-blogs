import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { CertificatesState, Certificate } from '../types'

const initialState: CertificatesState = {
    certificates: []
}

const certificatesSlice = createSlice({
    name: 'certificates',
    initialState,
    reducers: {
        // Add a new certificate (prevent duplicates by courseId)
        addCertificate: (state, action: PayloadAction<Certificate>) => {
            const exists = state.certificates.find(c => c.courseId === action.payload.courseId)
            if (!exists) {
                state.certificates.push(action.payload)
            }
        },

        // Remove a certificate
        removeCertificate: (state, action: PayloadAction<string>) => {
            state.certificates = state.certificates.filter(c => c.id !== action.payload)
        },

        // Clear all certificates
        clearCertificates: (state) => {
            state.certificates = []
        }
    }
})

export const {
    addCertificate,
    removeCertificate,
    clearCertificates
} = certificatesSlice.actions

// Selectors
export const selectCertificates = (state: { certificates: CertificatesState }) =>
    state.certificates.certificates

export const selectCertificatesCount = (state: { certificates: CertificatesState }) =>
    state.certificates.certificates.length

export const selectCertificateForCourse = (courseId: number) =>
    (state: { certificates: CertificatesState }) =>
        state.certificates.certificates.find(c => c.courseId === courseId)

export default certificatesSlice.reducer
