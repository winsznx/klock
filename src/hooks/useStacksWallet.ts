'use client'

import { useCallback, useState, useMemo } from 'react'
import { useAppKitAccount, modal } from '@reown/appkit/react'
import {
    getStacksContractByAddress,
    isStacksAddress,
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

export interface StacksContractInfo {
    network: 'testnet' | 'mainnet'
    contractAddress: string
    contractName: string
    fullContractId: string
    explorerUrl: string
}

async function fetchStacksWalletProfile(address: string): Promise<StacksUserProfile | null> {
    const network = isStacksMainnetAddress(address) ? 'mainnet' : 'testnet'
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
}

/**
 * Hook for Stacks contract interaction via Reown AppKit
 * Uses the Universal Provider to send stx_callContract RPC requests
 * 
 * Xverse/Leather connect via WalletConnect and support Stacks RPC methods
 */
export function useStacksWallet() {
    const { address, isConnected } = useAppKitAccount()

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [userProfile, setUserProfile] = useState<StacksUserProfile | null>(null)

    // Check if this is a Stacks connection (address starts with SP/ST)
    const isStacksConnected = isConnected && isStacksAddress(address)
    const isMainnet = isStacksMainnetAddress(address)

    // Get contract info based on network
    const contractInfo: StacksContractInfo = useMemo(() => {
        const contract = getStacksContractByAddress(address)
        return {
            ...contract,
            network: isMainnet ? 'mainnet' as const : 'testnet' as const,
        }
    }, [address, isMainnet])

    /**
     * Execute a contract call using the Universal Provider
     * This sends stx_callContract through the WalletConnect session
     */
    const executeContractCall = useCallback(async (
        functionName: string,
        functionArgs: string[] = []
    ): Promise<{ success: boolean; txId?: string; error?: string }> => {
        if (!isStacksConnected || !address) {
            return { success: false, error: 'Stacks wallet not connected' }
        }

        if (!modal) {
            return { success: false, error: 'AppKit not initialized' }
        }

        const contract = getStacksContractByAddress(address)

        setIsLoading(true)
        setError(null)

        console.log('[Stacks] Executing contract call via Universal Provider:', {
            contract: contract.fullContractId,
            functionName,
            functionArgs,
        })

        try {
            // Get the Universal Provider from AppKit
            const universalProvider = await modal.getUniversalProvider()

            if (!universalProvider) {
                throw new Error('Universal Provider not available')
            }

            console.log('[Stacks] Universal Provider obtained')

            // Get the active session topic
            const session = universalProvider.session
            if (!session) {
                throw new Error('No active WalletConnect session')
            }

            console.log('[Stacks] Session namespaces:', Object.keys(session.namespaces || {}))

            // Find the correct chain ID from the session namespaces
            // Priority: 1. stacks namespace, 2. bip122 namespace with STX address
            let targetChainId: string | undefined
            let hasStacksMethods = false

            // First check if stacks namespace is available (preferred)
            const stacksNs = session.namespaces?.stacks
            if (stacksNs?.accounts && stacksNs.accounts.length > 0) {
                // Get the chain ID from the first stacks account (format: stacks:chainRef:address)
                const parts = stacksNs.accounts[0].split(':')
                if (parts.length >= 2) {
                    targetChainId = `${parts[0]}:${parts[1]}`
                }
                // Check if stacks methods are available
                hasStacksMethods = stacksNs.methods?.includes('stx_callContract') || false
                console.log('[Stacks] Found stacks namespace:', stacksNs.accounts)
                console.log('[Stacks] Stacks methods:', stacksNs.methods)
            }

            // If no stacks namespace or no methods, check bip122 (where Xverse puts STX addresses)
            if (!targetChainId || !hasStacksMethods) {
                const bip122 = session.namespaces?.bip122
                if (bip122?.accounts && bip122.accounts.length > 0) {
                    const parts = bip122.accounts[0].split(':')
                    if (parts.length >= 2) {
                        targetChainId = `${parts[0]}:${parts[1]}`
                    }
                    console.log('[Stacks] Using bip122 namespace:', bip122.accounts)
                    console.log('[Stacks] bip122 methods:', bip122.methods)
                }
            }

            // Don't override with stacks namespace if it's not in the session
            // Leather/Xverse put STX addresses in bip122 namespace
            console.log('[Stacks] Final chain ID:', targetChainId || 'none')

            // Prepare the request
            const requestPayload = {
                method: 'stx_callContract',
                params: {
                    contract: contract.fullContractId,
                    functionName,
                    functionArgs,
                }
            }

            console.log('[Stacks] Request payload:', requestPayload)

            // Send the request with the bip122 chain ID from the session
            // The wallet should forward stx_* methods to the Stacks handler
            let result
            if (targetChainId) {
                result = await universalProvider.request(requestPayload, targetChainId)
            } else {
                result = await universalProvider.request(requestPayload)
            }

            console.log('[Stacks] Transaction result:', result)
            setIsLoading(false)

            const txResult = result as { txid?: string; transaction?: string }
            if (txResult && txResult.txid) {
                return { success: true, txId: txResult.txid }
            }

            return { success: true, txId: txResult?.transaction }
        } catch (err: any) {
            const errorMessage = err?.message || err?.toString() || 'Transaction failed'
            console.error('[Stacks] Contract call error:', err)
            console.error('[Stacks] Error message:', errorMessage)
            setError(errorMessage)
            setIsLoading(false)
            return { success: false, error: errorMessage }
        }
    }, [isStacksConnected, address])

    // Quest functions - pass Clarity-formatted arguments
    const dailyCheckin = useCallback(() =>
        executeContractCall('daily-checkin', []), [executeContractCall])

    const relaySignal = useCallback(() =>
        executeContractCall('relay-signal', []), [executeContractCall])

    const updateAtmosphere = useCallback((weatherCode: number) =>
        executeContractCall('update-atmosphere', [`u${weatherCode}`]), [executeContractCall])

    const nudgeFriend = useCallback((friendAddress: string) =>
        executeContractCall('nudge-friend', [`'${friendAddress}`]), [executeContractCall])

    const commitMessage = useCallback((message: string) =>
        executeContractCall('commit-message', [`"${message}"`]), [executeContractCall])

    const predictPulse = useCallback((level: number) =>
        executeContractCall('predict-pulse', [`u${level}`]), [executeContractCall])

    const claimDailyCombo = useCallback(() =>
        executeContractCall('claim-daily-combo-bonus', []), [executeContractCall])

    // Check if quest is completed (using bitmap)
    const isQuestCompleted = useCallback((questId: number): boolean => {
        if (!userProfile) return false
        return isStacksQuestCompleted(userProfile.questBitmap, questId as PulseQuestId)
    }, [userProfile])

    // Fetch user profile from Stacks API
    const refreshData = useCallback(async () => {
        if (!address || !isStacksConnected) return

        try {
            setIsLoading(true)
            const profile = await fetchStacksWalletProfile(address)
            setUserProfile(profile)
        } catch (err) {
            console.error('[Stacks] Error fetching user profile:', err)
        } finally {
            setIsLoading(false)
        }
    }, [address, isStacksConnected])

    return {
        // Connection state
        isConnected: isStacksConnected,
        isMainnet,
        address: isStacksConnected ? address : null,

        // Contract info
        contractInfo,

        // User data
        userProfile,

        // Loading/error states
        isLoading,
        error,

        // Quest actions
        dailyCheckin,
        relaySignal,
        updateAtmosphere,
        nudgeFriend,
        commitMessage,
        predictPulse,
        claimDailyCombo,

        // Utilities
        refreshData,
        isQuestCompleted,
    }
}
