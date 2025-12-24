'use client'

import { useCallback, useState, useEffect, createContext, useContext, type ReactNode } from 'react'
import {
    showConnect,
    UserSession,
    AppConfig,
    openContractCall,
} from '@stacks/connect'
import {
    uintCV,
    stringUtf8CV,
    principalCV,
    PostConditionMode,
    cvToHex
} from '@stacks/transactions'
import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network'
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

// Get project ID for WalletConnect bridge
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || ''

// App configuration for @stacks/connect
const appConfig = new AppConfig(['store_write', 'publish_data'])

// Create a persistent user session
const userSession = new UserSession({ appConfig })

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
 * Uses @stacks/connect with WalletConnect for mobile wallet support
 */
export function StacksProvider({ children }: { children: ReactNode }) {
    const [isConnected, setIsConnected] = useState(false)
    const [address, setAddress] = useState<string | null>(null)
    const [isMainnet, setIsMainnet] = useState(false)
    const [userProfile, setUserProfile] = useState<StacksUserProfile | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

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

    // Check for existing session on mount
    useEffect(() => {
        if (userSession.isUserSignedIn()) {
            const userData = userSession.loadUserData()
            const profile = userData.profile
            // Determine network from address prefix (SP = mainnet, ST = testnet)
            const stxAddress = userData.profile?.stxAddress?.mainnet || userData.profile?.stxAddress?.testnet
            if (stxAddress) {
                setAddress(stxAddress)
                setIsMainnet(stxAddress.startsWith('SP'))
                setIsConnected(true)
            }
        }
    }, [])

    // Connect to Stacks wallet
    const connectWallet = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            showConnect({
                appDetails: {
                    name: 'PULSE',
                    icon: typeof window !== 'undefined'
                        ? `${window.location.origin}/icon.png`
                        : 'https://klock-jade.vercel.app/icon.png',
                },
                // Enable WalletConnect for mobile wallet QR scanning
                ...(projectId && { walletConnectProjectId: projectId }),
                onFinish: () => {
                    if (userSession.isUserSignedIn()) {
                        const userData = userSession.loadUserData()
                        const stxAddress = userData.profile?.stxAddress?.mainnet || userData.profile?.stxAddress?.testnet
                        if (stxAddress) {
                            setAddress(stxAddress)
                            setIsMainnet(stxAddress.startsWith('SP'))
                            setIsConnected(true)
                        }
                    }
                    setIsLoading(false)
                },
                onCancel: () => {
                    setError('Connection cancelled')
                    setIsLoading(false)
                },
                userSession,
            })
        } catch (err) {
            console.error('Failed to connect Stacks wallet:', err)
            setError(err instanceof Error ? err.message : 'Failed to connect wallet')
            setIsLoading(false)
        }
    }, [])

    // Disconnect wallet
    const disconnectWallet = useCallback(() => {
        userSession.signUserOut()
        setIsConnected(false)
        setAddress(null)
        setUserProfile(null)
    }, [])

    // Get the Stacks network
    const getNetwork = useCallback(() => {
        return isMainnet ? STACKS_MAINNET : STACKS_TESTNET
    }, [isMainnet])

    // Execute a contract call
    const executeContractCall = useCallback(async (
        functionName: string,
        functionArgs: any[] = []
    ): Promise<{ success: boolean; txId?: string; error?: string }> => {
        if (!isConnected || !address) {
            return { success: false, error: 'Wallet not connected' }
        }

        const contract = isMainnet ? STACKS_CONTRACTS.mainnet : STACKS_CONTRACTS.testnet
        const network = getNetwork()

        setIsLoading(true)
        setError(null)

        try {
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
    }, [isConnected, address, isMainnet, getNetwork])

    // Quest functions
    const dailyCheckin = useCallback(() =>
        executeContractCall('daily-checkin', []), [executeContractCall])

    const relaySignal = useCallback(() =>
        executeContractCall('relay-signal', []), [executeContractCall])

    const updateAtmosphere = useCallback((weatherCode: number) =>
        executeContractCall('update-atmosphere', [uintCV(weatherCode)]), [executeContractCall])

    const nudgeFriend = useCallback((friendAddress: string) =>
        executeContractCall('nudge-friend', [principalCV(friendAddress)]), [executeContractCall])

    const commitMessage = useCallback((message: string) =>
        executeContractCall('commit-message', [stringUtf8CV(message)]), [executeContractCall])

    const predictPulse = useCallback((level: number) =>
        executeContractCall('predict-pulse', [uintCV(level)]), [executeContractCall])

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
