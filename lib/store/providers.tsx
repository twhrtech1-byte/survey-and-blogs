'use client'

import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { store, persistor } from './index'
import { useStoreMigration } from './useMigration'

function MigrationWrapper({ children }: { children: React.ReactNode }) {
    useStoreMigration()
    return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <MigrationWrapper>
                    {children}
                </MigrationWrapper>
            </PersistGate>
        </Provider>
    )
}
