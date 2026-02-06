'use client'

import { useEffect, useRef } from 'react'
import { migrateLocalStorageToRedux, shouldRunMigration } from './migrate'

/**
 * Hook to run localStorage migration once on app mount
 * Safe to call multiple times - only runs once
 */
export function useStoreMigration() {
    const migrationRan = useRef(false)

    useEffect(() => {
        if (!migrationRan.current && shouldRunMigration()) {
            console.log('[Redux] Starting migration from localStorage...')
            migrateLocalStorageToRedux()
            migrationRan.current = true
        }
    }, [])
}
