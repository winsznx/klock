'use client'

import React, { createContext, useContext, useCallback, useState, useEffect, ReactNode } from 'react'
import { connect, request, isConnected, disconnect as stacksDisconnect, getLocalStorage } from '@stacks/connect'
import { uintCV, stringAsciiCV, principalCV, cvToHex, hexToCV, ClarityType } from '@stacks/transactions'
import { STACKS_CONTRACTS } from '@/config/contracts'

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

// Helper to fetch quest statuses from the contract
async function fetchQuestStatuses(
    address: string,
    contractInfo: { apiUrl: string; contractAddress: string; contractName: string }
): Promise<StacksUserProfile | null> {
    try {
        // For each quest ID (1-10), check if completed today using has-completed-quest-today
        let questBitmap = 0

        for (let questId = 1; questId <= 10; questId++) {
            try {
                const response = await fetch(
                    `${contractInfo.apiUrl}/v2/contracts/call-read/${contractInfo.contractAddress}/${contractInfo.contractName}/has-completed-quest-today`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            sender: address,
                            arguments: [
                                // First arg: principal (user address) - properly encoded
                                cvToHex(principalCV(address)),
                                // Second arg: quest-id as uint128
                                cvToHex(uintCV(questId))
                            ],
                        }),
                    }
                )

                if (response.ok) {
                    const data = await response.json()
                    console.log(`[Stacks] Quest ${questId} status:`, data)
                    // If the response indicates the quest is completed
                    // Clarity true = 0x03, false = 0x04
                    if (data.okay && data.result === '0x03') {
                        questBitmap |= (1 << (questId - 1))
                    }
                }
            } catch (err) {
                console.error(`[Stacks] Error checking quest ${questId}:`, err)
            }
        }

        console.log('[Stacks] Quest bitmap:', questBitmap.toString(2).padStart(10, '0'))

        // Also fetch user profile for points/streak data
        let profile = {
            totalPoints: 0,
            currentStreak: 0,
            longestStreak: 0,
            lastCheckinDay: 0,
            questBitmap,
            level: 1,
            totalCheckins: 0,
        }

        try {
            const profileResponse = await fetch(
                `${contractInfo.apiUrl}/v2/contracts/call-read/${contractInfo.contractAddress}/${contractInfo.contractName}/get-user-profile`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sender: address,
                        arguments: [
                            cvToHex(principalCV(address))
                        ],
                    }),
                }
            )

            if (profileResponse.ok) {
                const profileData = await profileResponse.json()
                console.log('[Stacks] User profile response:', profileData)

                // Parse the Clarity tuple response
                if (profileData.okay && profileData.result && profileData.result !== '0x09') {
                    try {
                        const cv = hexToCV(profileData.result) as any
                        console.log('[Stacks] Parsed CV:', cv)

                        // Check if it's an optional some - handle both string and numeric type formats
                        const isSome = cv.type === ClarityType.OptionalSome || cv.type === 'some'
                        if (isSome && ('value' in cv)) {
                            const tuple = cv.value as any
                            const isTuple = tuple.type === ClarityType.Tuple || tuple.type === 'tuple'
                            if (isTuple && tuple.data) {
                                const data = tuple.data
                                profile.totalPoints = Number(data['total-points']?.value || 0)
                                profile.currentStreak = Number(data['current-streak']?.value || 0)
                                profile.longestStreak = Number(data['longest-streak']?.value || 0)
                                profile.level = Number(data['level']?.value || 1)
                                profile.totalCheckins = Number(data['total-checkins']?.value || 0)
                                console.log('[Stacks] Parsed profile:', profile)
                            }
                        }
                    } catch (parseErr) {
                        console.error('[Stacks] Error parsing profile CV:', parseErr)
                    }
                }
            }
        } catch (err) {
            console.error('[Stacks] Error fetching profile:', err)
        }

        return profile
    } catch (err) {
        console.error('[Stacks] Error fetching quest statuses:', err)
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
    const isMainnet = address?.startsWith('SP') ?? false

    // Get contract info
    const contractInfo = isMainnet ? STACKS_CONTRACTS.mainnet : STACKS_CONTRACTS.testnet

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
        executeContractCall('commit-message', [stringAsciiCV(message)]),
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
        return (userProfile.questBitmap & (1 << (questId - 1))) !== 0
    }, [userProfile])

    // Fetch user profile
    const refreshData = useCallback(async () => {
        if (!address) return

        try {
            setIsLoading(true)

            // For Stacks, we need to call the read-only function get-user-profile
            // The contract returns a tuple with user stats
            const response = await fetch(
                `${contractInfo.apiUrl}/v2/contracts/call-read/${contractInfo.contractAddress}/${contractInfo.contractName}/get-user-profile`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sender: address,
                        arguments: [
                            // Principal argument needs to be CV hex encoded
                            `0x0516${Buffer.from(address.slice(2)).toString('hex').padStart(40, '0')}`
                        ],
                    }),
                }
            )

            if (response.ok) {
                const data = await response.json()
                console.log('[Stacks] User profile API response:', data)

                if (data.okay && data.result) {
                    // Parse the Clarity hex response
                    // For now, let's try a simpler approach - check today's quest status
                    // by calling get-quest-status for each quest
                    try {
                        const questStatuses = await fetchQuestStatuses(address, contractInfo)
                        if (questStatuses) {
                            setUserProfile(questStatuses)
                        }
                    } catch (parseErr) {
                        console.error('[Stacks] Error parsing profile:', parseErr)
                    }
                }
            }
        } catch (err) {
            console.error('[Stacks] Error fetching profile:', err)
        } finally {
            setIsLoading(false)
        }
    }, [address, contractInfo])

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
