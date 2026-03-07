'use client'

import React, { createContext, useContext, useCallback, useState, useEffect, ReactNode } from 'react'
import { connect, request, isConnected, disconnect as stacksDisconnect, getLocalStorage } from '@stacks/connect'
import { uintCV, stringUtf8CV, principalCV } from '@stacks/transactions'
import {
    getStacksContractByAddress,
    isStacksMainnetAddress,
    isStacksQuestCompleted,
    readStacksCurrentDay,
    readStacksDailyQuestStatus,
    readStacksUserProfile,
    type PulseQuestId,
} from '@pulseprotocol/sdk'

// Types
export interface StacksUserProfile {
    totalPoints: number
    currentStreak: number
    longestStreak: number
    lastCheckinDay: number
    questBitmap: number
    level: number
    totalCheckins: number
}

async function fetchStacksProfile(address: string): Promise<StacksUserProfile | null> {
    const network = isStacksMainnetAddress(address) ? 'mainnet' : 'testnet'

    try {
        const [profile, currentDay] = await Promise.all([
            readStacksUserProfile(address, { network, sender: address }),
            readStacksCurrentDay({ network, sender: address }),
        ])

        if (!profile) {
            return null
        }

        const dailyQuestStatus = currentDay > 0
            ? await readStacksDailyQuestStatus(address, currentDay, { network, sender: address })
            : null

        return {
            totalPoints: profile.totalPoints,
            currentStreak: profile.currentStreak,
            longestStreak: profile.longestStreak,
            lastCheckinDay: profile.lastCheckinBlock,
            questBitmap: dailyQuestStatus?.completedQuests ?? 0,
            level: profile.level,
            totalCheckins: profile.totalCheckins,
        }
    } catch (err) {
        console.error('[Stacks] Error fetching data:', err)
        return null
    }
}

interface StacksContextType {
    // Connection
    isConnected: boolean
    address: string | null
    isMainnet: boolean
    connect: () => Promise<void>
    disconnect: () => void

    // Contract info
    contractInfo: {
        network: 'testnet' | 'mainnet'
        contractAddress: string
        contractName: string
        fullContractId: string
        explorerUrl: string
    }

    // User data
    userProfile: StacksUserProfile | null
    isLoading: boolean
    error: string | null

    // Quest actions
    dailyCheckin: () => Promise<{ success: boolean; txId?: string; error?: string }>
    relaySignal: () => Promise<{ success: boolean; txId?: string; error?: string }>
    updateAtmosphere: (weatherCode: number) => Promise<{ success: boolean; txId?: string; error?: string }>
    nudgeFriend: (friendAddress: string) => Promise<{ success: boolean; txId?: string; error?: string }>
    commitMessage: (message: string) => Promise<{ success: boolean; txId?: string; error?: string }>
    predictPulse: (level: number) => Promise<{ success: boolean; txId?: string; error?: string }>
    claimDailyCombo: () => Promise<{ success: boolean; txId?: string; error?: string }>

    // Utilities
    refreshData: () => Promise<void>
    isQuestCompleted: (questId: number) => boolean
}

const StacksContext = createContext<StacksContextType | undefined>(undefined)

export function StacksProvider({ children }: { children: ReactNode }) {
    const [connected, setConnected] = useState(false)
    const [address, setAddress] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [userProfile, setUserProfile] = useState<StacksUserProfile | null>(null)

    // Determine network from address
    const isMainnet = isStacksMainnetAddress(address)

    // Get contract info
    const contractInfo = getStacksContractByAddress(address)

    // Check if already connected on mount
    useEffect(() => {
        const checkConnection = () => {
            const isAlreadyConnected = isConnected()
            if (isAlreadyConnected) {
                const storage = getLocalStorage()
                if (storage?.addresses?.stx?.[0]?.address) {
                    setAddress(storage.addresses.stx[0].address)
                    setConnected(true)
                }
            }
        }
        checkConnection()
    }, [])

    // Connect to Stacks wallet
    const handleConnect = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)

            const result = await connect()

            console.log('[Stacks] Connect result:', result)

            // Get the STX address from the result
            const stxAddress = result.addresses.find(a => a.symbol === 'STX')?.address

            if (stxAddress) {
                setAddress(stxAddress)
                setConnected(true)
            }
        } catch (err: any) {
            console.error('[Stacks] Connect error:', err)
            setError(err?.message || 'Failed to connect')
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Disconnect
    const handleDisconnect = useCallback(() => {
        stacksDisconnect()
        setAddress(null)
        setConnected(false)
        setUserProfile(null)
    }, [])

    // Execute contract call helper
    const executeContractCall = useCallback(async (
        functionName: string,
        functionArgs: any[] = []
    ): Promise<{ success: boolean; txId?: string; error?: string }> => {
        if (!connected || !address) {
            return { success: false, error: 'Wallet not connected' }
        }

        setIsLoading(true)
        setError(null)

        try {
            // Use the new request API for contract calls
            const result = await request('stx_callContract', {
                contract: contractInfo.fullContractId,
                functionName,
                functionArgs: functionArgs.map(arg => {
                    // Serialize Clarity values to hex if needed
                    if (typeof arg === 'object' && arg.type) {
                        // Already a Clarity value, convert to hex
                        return arg
                    }
                    return arg
                }),
            })

            console.log('[Stacks] Transaction result:', result)
            setIsLoading(false)
            return { success: true, txId: result.txid }
        } catch (err: any) {
            const errorMessage = err?.message || 'Transaction failed'
            console.error('[Stacks] Contract call error:', err)
            setError(errorMessage)
            setIsLoading(false)
            return { success: false, error: errorMessage }
        }
    }, [connected, address, contractInfo])

    // Quest functions
    const dailyCheckin = useCallback(() =>
        executeContractCall('daily-checkin', []),
        [executeContractCall]
    )

    const relaySignal = useCallback(() =>
        executeContractCall('relay-signal', []),
        [executeContractCall]
    )

    const updateAtmosphere = useCallback((weatherCode: number) =>
        executeContractCall('update-atmosphere', [uintCV(weatherCode)]),
        [executeContractCall]
    )

    const nudgeFriend = useCallback((friendAddress: string) =>
        executeContractCall('nudge-friend', [principalCV(friendAddress)]),
        [executeContractCall]
    )

    const commitMessage = useCallback((message: string) =>
        executeContractCall('commit-message', [stringUtf8CV(message)]),
        [executeContractCall]
    )

    const predictPulse = useCallback((level: number) =>
        executeContractCall('predict-pulse', [uintCV(level)]),
        [executeContractCall]
    )

    const claimDailyCombo = useCallback(() =>
        executeContractCall('claim-daily-combo-bonus', []),
        [executeContractCall]
    )

    // Check if quest is completed
    const isQuestCompletedFn = useCallback((questId: number): boolean => {
        if (!userProfile) return false
        return isStacksQuestCompleted(userProfile.questBitmap, questId as PulseQuestId)
    }, [userProfile])

    // Fetch user profile
    const refreshData = useCallback(async () => {
        if (!address) return

        try {
            setIsLoading(true)
            const profile = await fetchStacksProfile(address)
            setUserProfile(profile)
        } catch (err) {
            console.error('[Stacks] Error fetching profile:', err)
        } finally {
            setIsLoading(false)
        }
    }, [address])

    // Fetch data when connected
    useEffect(() => {
        if (connected && address) {
            refreshData()
        }
    }, [connected, address, refreshData])

    return (
        <StacksContext.Provider value={{
            isConnected: connected,
            address,
            isMainnet,
            connect: handleConnect,
            disconnect: handleDisconnect,
            contractInfo: {
                ...contractInfo,
                network: isMainnet ? 'mainnet' : 'testnet',
            },
            userProfile,
            isLoading,
            error,
            dailyCheckin,
            relaySignal,
            updateAtmosphere,
            nudgeFriend,
            commitMessage,
            predictPulse,
            claimDailyCombo,
            refreshData,
            isQuestCompleted: isQuestCompletedFn,
        }}>
            {children}
        </StacksContext.Provider>
    )
}

export function useStacks() {
    const context = useContext(StacksContext)
    if (context === undefined) {
        throw new Error('useStacks must be used within a StacksProvider')
    }
    return context
}
