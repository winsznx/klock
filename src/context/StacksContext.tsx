'use client'

import { useCallback, useState, useEffect, createContext, useContext, type ReactNode } from 'react'
import { STACKS_CONTRACTS } from '@/config/contracts'

// Types
export interface StacksUserData {
    address: string
    isMainnet: boolean
}

export interface StacksUserProfile {
    totalPoints: number
    currentStreak: number
    longestStreak: number
    lastCheckinDay: number
    questBitmap: number
    level: number
    totalCheckins: number
}

export interface StacksContractInfo {
    network: 'testnet' | 'mainnet'
    contractAddress: string
    contractName: string
    fullContractId: string
    explorerUrl: string
}

// Context for Stacks connection state
interface StacksContextType {
    isConnected: boolean
    isMainnet: boolean
    address: string | null
    userProfile: StacksUserProfile | null
    isLoading: boolean
    error: string | null
    contractInfo: StacksContractInfo
    connectWallet: () => Promise<void>
    disconnectWallet: () => void
    // Quest functions
    dailyCheckin: () => Promise<{ success: boolean; txId?: string; error?: string }>
    relaySignal: () => Promise<{ success: boolean; txId?: string; error?: string }>
    updateAtmosphere: (weatherCode: number) => Promise<{ success: boolean; txId?: string; error?: string }>
    nudgeFriend: (friendAddress: string) => Promise<{ success: boolean; txId?: string; error?: string }>
    commitMessage: (message: string) => Promise<{ success: boolean; txId?: string; error?: string }>
    predictPulse: (level: number) => Promise<{ success: boolean; txId?: string; error?: string }>
    claimDailyCombo: () => Promise<{ success: boolean; txId?: string; error?: string }>
    isQuestCompleted: (questId: number) => boolean
    refreshData: () => Promise<void>
}

const StacksContext = createContext<StacksContextType | null>(null)

/**
 * Provider component for Stacks wallet connection
 * Uses @stacks/connect with the new connect() API
 */
export function StacksProvider({ children }: { children: ReactNode }) {
    const [isConnected, setIsConnected] = useState(false)
    const [address, setAddress] = useState<string | null>(null)
    const [isMainnet, setIsMainnet] = useState(false)
    const [userProfile, setUserProfile] = useState<StacksUserProfile | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isClient, setIsClient] = useState(false)

    // Get contract info based on network
    const contractInfo: StacksContractInfo = isMainnet
        ? {
            ...STACKS_CONTRACTS.mainnet,
            network: 'mainnet' as const,
        }
        : {
            ...STACKS_CONTRACTS.testnet,
            network: 'testnet' as const,
        }

    // Initialize on client only
    useEffect(() => {
        setIsClient(true)
    }, [])

    // Check for existing connection on mount (client only)
    useEffect(() => {
        if (!isClient) return

        const checkConnection = async () => {
            try {
                const { isConnected: checkIsConnected } = await import('@stacks/connect')
                const connected = checkIsConnected()

                if (connected) {
                    // Try to get stored address from localStorage
                    const storedAddress = localStorage.getItem('stacks_connected_address')
                    if (storedAddress) {
                        setAddress(storedAddress)
                        setIsMainnet(storedAddress.startsWith('SP'))
                        setIsConnected(true)
                    }
                }
            } catch (err) {
                console.error('Failed to check Stacks connection:', err)
            }
        }

        checkConnection()
    }, [isClient])

    // Connect to Stacks wallet using the new connect() API
    const connectWallet = useCallback(async () => {
        if (!isClient) return

        setIsLoading(true)
        setError(null)

        try {
            const { connect } = await import('@stacks/connect')

            // Use the new connect() API which returns address info
            const result = await connect()

            if (result && result.addresses && result.addresses.length > 0) {
                // Find the STX address (mainnet or testnet)
                const stxAddressInfo = result.addresses.find((addr: { address: string }) =>
                    addr.address.startsWith('SP') || addr.address.startsWith('ST')
                )

                if (stxAddressInfo) {
                    setAddress(stxAddressInfo.address)
                    setIsMainnet(stxAddressInfo.address.startsWith('SP'))
                    setIsConnected(true)
                    // Store in localStorage for persistence
                    localStorage.setItem('stacks_connected_address', stxAddressInfo.address)
                }
            }

            setIsLoading(false)
        } catch (err) {
            console.error('Failed to connect Stacks wallet:', err)
            setError(err instanceof Error ? err.message : 'Failed to connect wallet')
            setIsLoading(false)
        }
    }, [isClient])

    // Disconnect wallet
    const disconnectWallet = useCallback(async () => {
        try {
            const { disconnect } = await import('@stacks/connect')
            disconnect()
        } catch (err) {
            console.error('Failed to disconnect:', err)
        }
        setIsConnected(false)
        setAddress(null)
        setUserProfile(null)
        localStorage.removeItem('stacks_connected_address')
    }, [])

    // Get the Stacks network
    const getNetwork = useCallback(async () => {
        const { STACKS_MAINNET, STACKS_TESTNET } = await import('@stacks/network')
        return isMainnet ? STACKS_MAINNET : STACKS_TESTNET
    }, [isMainnet])

    // Execute a contract call
    const executeContractCall = useCallback(async (
        functionName: string,
        functionArgs: any[] = []
    ): Promise<{ success: boolean; txId?: string; error?: string }> => {
        if (!isClient) {
            return { success: false, error: 'Client not ready' }
        }
        if (!isConnected || !address) {
            return { success: false, error: 'Wallet not connected' }
        }

        const contract = isMainnet ? STACKS_CONTRACTS.mainnet : STACKS_CONTRACTS.testnet

        setIsLoading(true)
        setError(null)

        try {
            const { openContractCall } = await import('@stacks/connect')
            const { PostConditionMode } = await import('@stacks/transactions')
            const network = await getNetwork()

            return new Promise((resolve) => {
                openContractCall({
                    network,
                    contractAddress: contract.contractAddress,
                    contractName: contract.contractName,
                    functionName,
                    functionArgs,
                    postConditionMode: PostConditionMode.Deny,
                    postConditions: [],
                    appDetails: {
                        name: 'PULSE',
                        icon: typeof window !== 'undefined'
                            ? `${window.location.origin}/icon.png`
                            : 'https://klock-jade.vercel.app/icon.png',
                    },
                    onFinish: (data) => {
                        console.log('Stacks tx submitted:', data.txId)
                        setIsLoading(false)
                        resolve({ success: true, txId: data.txId })
                    },
                    onCancel: () => {
                        setIsLoading(false)
                        resolve({ success: false, error: 'Transaction cancelled' })
                    },
                })
            })
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Transaction failed'
            setError(errorMessage)
            setIsLoading(false)
            return { success: false, error: errorMessage }
        }
    }, [isClient, isConnected, address, isMainnet, getNetwork])

    // Quest functions
    const dailyCheckin = useCallback(() =>
        executeContractCall('daily-checkin', []), [executeContractCall])

    const relaySignal = useCallback(() =>
        executeContractCall('relay-signal', []), [executeContractCall])

    const updateAtmosphere = useCallback(async (weatherCode: number) => {
        const { uintCV } = await import('@stacks/transactions')
        return executeContractCall('update-atmosphere', [uintCV(weatherCode)])
    }, [executeContractCall])

    const nudgeFriend = useCallback(async (friendAddress: string) => {
        const { principalCV } = await import('@stacks/transactions')
        return executeContractCall('nudge-friend', [principalCV(friendAddress)])
    }, [executeContractCall])

    const commitMessage = useCallback(async (message: string) => {
        const { stringUtf8CV } = await import('@stacks/transactions')
        return executeContractCall('commit-message', [stringUtf8CV(message)])
    }, [executeContractCall])

    const predictPulse = useCallback(async (level: number) => {
        const { uintCV } = await import('@stacks/transactions')
        return executeContractCall('predict-pulse', [uintCV(level)])
    }, [executeContractCall])

    const claimDailyCombo = useCallback(() =>
        executeContractCall('claim-daily-combo-bonus', []), [executeContractCall])

    // Check if quest is completed
    const isQuestCompleted = useCallback((questId: number): boolean => {
        if (!userProfile) return false
        return (userProfile.questBitmap & (1 << (questId - 1))) !== 0
    }, [userProfile])

    // Fetch user profile from Stacks API
    const refreshData = useCallback(async () => {
        if (!address) return

        const contract = isMainnet ? STACKS_CONTRACTS.mainnet : STACKS_CONTRACTS.testnet

        try {
            setIsLoading(true)
            const { principalCV, cvToHex } = await import('@stacks/transactions')

            const response = await fetch(
                `${contract.apiUrl}/v2/contracts/call-read/${contract.contractAddress}/${contract.contractName}/get-user-profile`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        sender: address,
                        arguments: [cvToHex(principalCV(address))],
                    }),
                }
            )

            if (response.ok) {
                const data = await response.json()
                if (data.okay && data.result) {
                    console.log('User profile:', data.result)
                    // TODO: Parse Clarity tuple response into StacksUserProfile
                }
            }
        } catch (err) {
            console.error('Error fetching Stacks user profile:', err)
        } finally {
            setIsLoading(false)
        }
    }, [address, isMainnet])

    // Auto-refresh on connection
    useEffect(() => {
        if (isConnected && address) {
            refreshData()
        }
    }, [isConnected, address, refreshData])

    const value: StacksContextType = {
        isConnected,
        isMainnet,
        address,
        userProfile,
        isLoading,
        error,
        contractInfo,
        connectWallet,
        disconnectWallet,
        dailyCheckin,
        relaySignal,
        updateAtmosphere,
        nudgeFriend,
        commitMessage,
        predictPulse,
        claimDailyCombo,
        isQuestCompleted,
        refreshData,
    }

    return (
        <StacksContext.Provider value={value}>
            {children}
        </StacksContext.Provider>
    )
}

/**
 * Hook to access Stacks wallet and contract functions
 */
export function useStacks() {
    const context = useContext(StacksContext)
    if (!context) {
        throw new Error('useStacks must be used within a StacksProvider')
    }
    return context
}

/**
 * Hook to check multi-chain connection status
 */
export function useMultiChainStatus() {
    const stacks = useContext(StacksContext)

    return {
        isStacksConnected: stacks?.isConnected || false,
        stacksAddress: stacks?.address || null,
        stacksNetwork: stacks?.isMainnet ? 'mainnet' : 'testnet',
    }
}
