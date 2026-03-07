'use client'

import { useAppKitAccount } from '@reown/appkit/react'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { PulseAuthContextValue } from './types.js'
import { createPulseAuthStorageKey } from './utils.js'

const PulseAuthContext = createContext<PulseAuthContextValue | undefined>(undefined)

interface PulseAuthProviderProps {
    children: React.ReactNode
    namespace?: string
    storageKey?: string
}

export function PulseAuthProvider({
    children,
    namespace = 'pulse',
    storageKey = createPulseAuthStorageKey(namespace),
}: PulseAuthProviderProps) {
    const { address, isConnected } = useAppKitAccount()
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        if (typeof window === 'undefined' || !isConnected || !address) {
            return
        }

        setIsLoggedIn(localStorage.getItem(storageKey) === address)
    }, [address, isConnected, storageKey])

    useEffect(() => {
        if (isConnected && address) {
            return
        }

        setIsLoggedIn(false)
        if (typeof window !== 'undefined') {
            localStorage.removeItem(storageKey)
        }
    }, [address, isConnected, storageKey])

    const login = useCallback(() => {
        if (!isConnected || !address) {
            return
        }

        setIsLoggedIn(true)
        if (typeof window !== 'undefined') {
            localStorage.setItem(storageKey, address)
        }
    }, [address, isConnected, storageKey])

    const logout = useCallback(() => {
        setIsLoggedIn(false)
        if (typeof window !== 'undefined') {
            localStorage.removeItem(storageKey)
        }
    }, [storageKey])

    const value = useMemo<PulseAuthContextValue>(() => ({
        isLoggedIn,
        isConnected,
        address,
        login,
        logout,
        storageKey,
    }), [address, isConnected, isLoggedIn, login, logout, storageKey])

    return (
        <PulseAuthContext.Provider value={value}>
            {children}
        </PulseAuthContext.Provider>
    )
}

export function usePulseAuth() {
    const context = useContext(PulseAuthContext)
    if (!context) {
        throw new Error('usePulseAuth must be used within a PulseAuthProvider')
    }

    return context
}

export const AuthProvider = PulseAuthProvider
export const useAuth = usePulseAuth
