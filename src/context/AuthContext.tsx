'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
// Use useAppKitAccount from Reown instead of useAccount from wagmi
// This is CRITICAL because wagmi's useAccount only works for EVM chains,
// while useAppKitAccount works for ALL chains including Bitcoin/Leather
import { useAppKitAccount } from '@reown/appkit/react'

interface AuthContextType {
    isLoggedIn: boolean
    isConnected: boolean
    address: string | undefined
    login: () => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // useAppKitAccount works for ALL chains (EVM, Bitcoin, Solana)
    // Unlike wagmi's useAccount which only works for EVM chains
    const { address, isConnected } = useAppKitAccount()
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    // Check localStorage for login state on mount
    useEffect(() => {
        if (typeof window !== 'undefined' && isConnected && address) {
            const storedAddress = localStorage.getItem('pulse_logged_in_address')
            if (storedAddress === address) {
                setIsLoggedIn(true)
            }
        }
    }, [isConnected, address])

    // Reset login state when wallet disconnects or address changes
    useEffect(() => {
        if (!isConnected || !address) {
            setIsLoggedIn(false)
            if (typeof window !== 'undefined') {
                localStorage.removeItem('pulse_logged_in_address')
            }
        }
    }, [isConnected, address])

    const login = useCallback(() => {
        if (isConnected && address) {
            setIsLoggedIn(true)
            if (typeof window !== 'undefined') {
                localStorage.setItem('pulse_logged_in_address', address)
            }
        }
    }, [isConnected, address])

    const logout = useCallback(() => {
        setIsLoggedIn(false)
        if (typeof window !== 'undefined') {
            localStorage.removeItem('pulse_logged_in_address')
        }
    }, [])

    return (
        <AuthContext.Provider value={{
            isLoggedIn,
            isConnected,
            address,
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
