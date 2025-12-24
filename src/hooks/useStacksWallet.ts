'use client'

import { useCallback, useState, useMemo } from 'react'
import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
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

export interface StacksContractInfo {
    network: 'testnet' | 'mainnet'
    contractAddress: string
    contractName: string
    fullContractId: string
    explorerUrl: string
}

/**
 * Helper to detect if an address is a Stacks address
 */
function isStacksAddress(address: string | undefined): boolean {
    if (!address) return false
    return address.startsWith('SP') || address.startsWith('ST')
}

/**
 * Helper to detect if address is mainnet Stacks
 */
function isStacksMainnet(address: string | undefined): boolean {
    if (!address) return false
    return address.startsWith('SP')
}

/**
 * Hook for Stacks contract interaction via Reown AppKit
 * Uses the WalletConnect RPC methods (stx_callContract) directly
 * 
 * Leather/Xverse connect via BitcoinAdapter (bip122 namespace) but provide STX addresses
 * We detect STX addresses by prefix and use stx_* RPC methods
 */
export function useStacksWallet() {
    const { address, isConnected } = useAppKitAccount()
    // Use 'bip122' (Bitcoin namespace) since Leather connects through BitcoinAdapter
    const { walletProvider } = useAppKitProvider<any>('bip122')

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [userProfile, setUserProfile] = useState<StacksUserProfile | null>(null)

    // Check if this is a Stacks connection (address starts with SP/ST)
    const isStacksConnected = isConnected && isStacksAddress(address)
    const isMainnet = isStacksMainnet(address)

    // Get contract info based on network
    const contractInfo: StacksContractInfo = useMemo(() => {
        const contract = isMainnet ? STACKS_CONTRACTS.mainnet : STACKS_CONTRACTS.testnet
        return {
            ...contract,
            network: isMainnet ? 'mainnet' as const : 'testnet' as const,
        }
    }, [isMainnet])

    /**
     * Execute a contract call using Reown's stx_callContract RPC method
     * This sends the request through the existing WalletConnect session
     */
    const executeContractCall = useCallback(async (
        functionName: string,
        functionArgs: string[] = []
    ): Promise<{ success: boolean; txId?: string; error?: string }> => {
        if (!isStacksConnected || !address) {
            return { success: false, error: 'Stacks wallet not connected' }
        }

        if (!walletProvider) {
            return { success: false, error: 'Wallet provider not available. Please reconnect.' }
        }

        const contract = isMainnet ? STACKS_CONTRACTS.mainnet : STACKS_CONTRACTS.testnet

        setIsLoading(true)
        setError(null)

        try {
            // Use the Reown RPC method for Stacks contract calls
            // This works through the WalletConnect session established via BitcoinAdapter
            const result = await walletProvider.request({
                method: 'stx_callContract',
                params: {
                    contract: contract.fullContractId,
                    functionName,
                    functionArgs,
                }
            })

            console.log('Stacks tx result:', result)
            setIsLoading(false)

            if (result && result.txid) {
                return { success: true, txId: result.txid }
            }

            return { success: true, txId: result?.transaction }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Transaction failed'
            console.error('Stacks contract call error:', err)
            setError(errorMessage)
            setIsLoading(false)
            return { success: false, error: errorMessage }
        }
    }, [isStacksConnected, address, isMainnet, walletProvider])

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
        return (userProfile.questBitmap & (1 << (questId - 1))) !== 0
    }, [userProfile])

    // Fetch user profile from Stacks API
    const refreshData = useCallback(async () => {
        if (!address || !isStacksConnected) return

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
                        arguments: [`0x${Buffer.from(address).toString('hex')}`],
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
    }, [address, isStacksConnected, isMainnet])

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
