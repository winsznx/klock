'use client'

import { useAppKitAccount } from '@reown/appkit/react'
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { PulseAuthContextValue } from './types.js'
import { createPulseAuthStorageKey } from './utils.js'

const PulseAuthContext = createContext<PulseAuthContextValue | undefined>(undefined)

const safeGetItem = (key: string): string | null => {
    if (typeof window === 'undefined') return null
    try {
        return localStorage.getItem(key)
    } catch {
        return null
    }
}
const safeSetItem = (key: string, value: string): void => {
    if (typeof window === 'undefined') return
    try {
        localStorage.setItem(key, value)
    } catch (e) {
        console.warn('[PulseAuth] Failed to set storage item:', e)
    }
}
const safeRemoveItem = (key: string): void => {
    if (typeof window === 'undefined') return
    try {
        localStorage.removeItem(key)
    } catch (e) {
        console.warn('[PulseAuth] Failed to remove storage item:', e)
    }
}

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
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)

    useEffect(() => {
        if (!isConnected || !address) {
            return
        }

        setIsLoggedIn(safeGetItem(storageKey) === address)
    }, [address, isConnected, storageKey])

    useEffect(() => {
        if (isConnected && address) {
            return
        }

        setIsLoggedIn(false)
        safeRemoveItem(storageKey)
    }, [address, isConnected, storageKey])

    const login = useCallback(() => {
        if (!isConnected || !address) {
            return
        }

        setIsLoggedIn(true)
        safeSetItem(storageKey, address)
    }, [address, isConnected, storageKey])

    const logout = useCallback(() => {
        setIsLoggedIn(false)
        safeRemoveItem(storageKey)
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

