'use client'

import { useCallback, useState, useEffect } from 'react'
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'
import {
    openContractCall,
    showConnect,
    UserSession,
    AppConfig
} from '@stacks/connect'
import {
    uintCV,
    stringUtf8CV,
    principalCV,
    PostConditionMode,
    cvToHex
} from '@stacks/transactions'
import { STACKS_MAINNET, STACKS_TESTNET } from '@stacks/network'
import { STACKS_CONTRACTS, QUEST_IDS } from '@/config/contracts'

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

/**
 * Hook for interacting with the PULSE Clarity smart contract on Stacks
 * Uses @stacks/connect with WalletConnect bridge for transactions
 */
export function useStacksContract() {
    const { address, isConnected, caipAddress } = useAppKitAccount()
    const { chainId } = useAppKitNetwork()

    const [userProfile, setUserProfile] = useState<StacksUserProfile | null>(null)
    const [completedQuests, setCompletedQuests] = useState<number[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [userSession, setUserSession] = useState<UserSession | null>(null)

    // Determine if we're on Stacks network based on chainId or caipAddress
    const isStacksNetwork = caipAddress?.includes('stacks:') ||
        chainId?.toString().includes('stacks')

    // Determine mainnet vs testnet
    const isMainnet = caipAddress?.includes('stacks:1:') || false

    // Get the appropriate contract configuration
    const getContractInfo = useCallback((): StacksContractInfo => {
        const contract = isMainnet ? STACKS_CONTRACTS.mainnet : STACKS_CONTRACTS.testnet
        return {
            network: isMainnet ? 'mainnet' : 'testnet',
            contractAddress: contract.contractAddress,
            contractName: contract.contractName,
            fullContractId: contract.fullContractId,
            explorerUrl: contract.explorerUrl,
        }
    }, [isMainnet])

    const contractInfo = getContractInfo()

    // Get the Stacks network object
    const getNetwork = useCallback(() => {
        return isMainnet ? STACKS_MAINNET : STACKS_TESTNET
    }, [isMainnet])

    // Initialize user session
    useEffect(() => {
        const session = new UserSession({ appConfig })
        setUserSession(session)
    }, [])

    // Connect to Stacks wallet via WalletConnect
    const connectStacksWallet = useCallback(async () => {
        if (!projectId) {
            setError('WalletConnect Project ID not configured')
            return
        }

        try {
            showConnect({
                appDetails: {
                    name: 'PULSE',
                    icon: 'https://klock-jade.vercel.app/icon.png',
                },
                onFinish: () => {
                    console.log('Stacks wallet connected via WalletConnect')
                },
                onCancel: () => {
                    console.log('User cancelled Stacks connection')
                },
                userSession: userSession || undefined,
            })
        } catch (err) {
            console.error('Failed to connect Stacks wallet:', err)
            setError('Failed to connect Stacks wallet')
        }
    }, [userSession])

    // Fetch user profile from Stacks API
    const fetchUserProfile = useCallback(async () => {
        if (!address || !isStacksNetwork) return

        const contract = isMainnet ? STACKS_CONTRACTS.mainnet : STACKS_CONTRACTS.testnet

        try {
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
                // Parse the Clarity response
                if (data.okay && data.result) {
                    console.log('User profile:', data.result)
                }
            }
        } catch (err) {
            console.error('Error fetching Stacks user profile:', err)
        }
    }, [address, isStacksNetwork, isMainnet])

    // Execute a contract call using @stacks/connect
    const executeContractCall = useCallback(async (
        functionName: string,
        functionArgs: any[] = []
    ): Promise<{ success: boolean; txId?: string; error?: string }> => {
        if (!address || !isStacksNetwork) {
            return { success: false, error: 'Wallet not connected to Stacks' }
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
                        icon: 'https://klock-jade.vercel.app/icon.png',
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
    }, [address, isStacksNetwork, isMainnet, getNetwork])

    // Individual quest functions
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

    // Check if quest is completed (using bitmap)
    const isQuestCompleted = useCallback((questId: number): boolean => {
        if (!userProfile) return false
        return (userProfile.questBitmap & (1 << (questId - 1))) !== 0
    }, [userProfile])

    // Refresh data
    const refreshData = useCallback(async () => {
        setIsLoading(true)
        try {
            await fetchUserProfile()
        } finally {
            setIsLoading(false)
        }
    }, [fetchUserProfile])

    // Auto-fetch on connection
    useEffect(() => {
        if (isConnected && isStacksNetwork) {
            refreshData()
        }
    }, [isConnected, isStacksNetwork, refreshData])

    return {
        // State
        userProfile,
        completedQuests,
        isLoading,
        error,
        contractInfo,

        // Connection info
        isStacksNetwork,
        isMainnet,
        isConnected: isConnected && isStacksNetwork,
        address,

        // Actions
        connectStacksWallet,
        refreshData,
        dailyCheckin,
        relaySignal,
        updateAtmosphere,
        nudgeFriend,
        commitMessage,
        predictPulse,
        claimDailyCombo,

        // Helpers
        isQuestCompleted,
        getNetwork,
    }
}

/**
 * Combined hook that automatically selects the right contract based on connected network
 * Abstracts away the complexity of multi-chain support
 */
export function useMultiChainContract() {
    const { caipAddress } = useAppKitAccount()

    // Determine which chain type is connected
    const isStacks = caipAddress?.includes('stacks:') || false
    const isEVM = caipAddress?.includes('eip155:') || false
    const isBitcoin = caipAddress?.includes('bip122:') || false

    return {
        isStacks,
        isEVM,
        isBitcoin,
        chainType: isStacks ? 'stacks' : isEVM ? 'evm' : isBitcoin ? 'bitcoin' : 'unknown',
    }
}
