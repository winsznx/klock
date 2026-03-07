'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAccount, useChainId, usePublicClient, useWalletClient } from 'wagmi'
import {
    getBaseContract,
    PULSE_ABI,
    QUEST_IDS,
    getStacksContract,
    isBaseChain,
    isBaseTestnetChain,
} from '@pulseprotocol/sdk'
import type { Address } from 'viem'

// Types
export interface UserProfile {
    totalPoints: bigint
    currentStreak: bigint
    longestStreak: bigint
    lastCheckinTime: bigint
    totalCheckins: bigint
    level: bigint
    stakedAmount: bigint
    joinedTime: bigint
    exists: boolean
}

export interface GlobalStats {
    totalUsers: bigint
    totalCheckins: bigint
    totalPointsDistributed: bigint
}

export interface ContractInfo {
    chainType: 'base' | 'stacks' | 'unknown'
    network: 'testnet' | 'mainnet'
    contractAddress: string
    explorerUrl: string
}

/**
 * Hook for interacting with the PULSE smart contract
 * Automatically selects the correct contract based on the connected network
 */
export function usePulseContract() {
    const { address, isConnected } = useAccount()
    const chainId = useChainId()
    const publicClient = usePublicClient()
    const { data: walletClient } = useWalletClient()

    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
    const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null)
    const [completedQuests, setCompletedQuests] = useState<number[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Get contract info based on current chain
    const getContractInfo = useCallback((): ContractInfo => {
        if (!chainId) {
            return {
                chainType: 'unknown',
                network: 'testnet',
                contractAddress: '',
                explorerUrl: '',
            }
        }

        if (isBaseChain(chainId)) {
            const contract = getBaseContract(chainId)
            return {
                chainType: 'base',
                network: isBaseTestnetChain(chainId) ? 'testnet' : 'mainnet',
                contractAddress: contract.address,
                explorerUrl: contract.explorerUrl,
            }
        }

        // Default to unknown for non-Base EVM chains
        return {
            chainType: 'unknown',
            network: 'testnet',
            contractAddress: '',
            explorerUrl: '',
        }
    }, [chainId])

    const contractInfo = getContractInfo()
    const contract = chainId && isBaseChain(chainId) ? getBaseContract(chainId) : null

    // Fetch user profile
    const fetchUserProfile = useCallback(async () => {
        if (!address || !publicClient || !contract || !isBaseChain(chainId)) {
            return
        }

        try {
            const data = await publicClient.readContract({
                address: contract.address as Address,
                abi: PULSE_ABI,
                functionName: 'getUserProfile',
                args: [address],
            })

            if (data) {
                setUserProfile(data as UserProfile)
            }
        } catch (err) {
            console.error('Error fetching user profile:', err)
        }
    }, [address, publicClient, contract, chainId])

    // Fetch global stats
    const fetchGlobalStats = useCallback(async () => {
        if (!publicClient || !contract || !isBaseChain(chainId)) {
            return
        }

        try {
            const data = await publicClient.readContract({
                address: contract.address as Address,
                abi: PULSE_ABI,
                functionName: 'getGlobalStats',
            })

            if (data) {
                const [totalUsers, totalCheckins, totalPointsDistributed] = data as [bigint, bigint, bigint]
                setGlobalStats({ totalUsers, totalCheckins, totalPointsDistributed })
            }
        } catch (err) {
            console.error('Error fetching global stats:', err)
        }
    }, [publicClient, contract, chainId])

    // Check which quests are completed today
    const fetchCompletedQuests = useCallback(async () => {
        if (!address || !publicClient || !contract || !isBaseChain(chainId)) {
            return
        }

        try {
            const questIds = Object.values(QUEST_IDS)
            const completed: number[] = []

            for (const questId of questIds) {
                const isCompleted = await publicClient.readContract({
                    address: contract.address as Address,
                    abi: PULSE_ABI,
                    functionName: 'hasCompletedQuestToday',
                    args: [address, questId],
                })

                if (isCompleted) {
                    completed.push(questId)
                }
            }

            setCompletedQuests(completed)
        } catch (err) {
            console.error('Error fetching completed quests:', err)
        }
    }, [address, publicClient, contract, chainId])

    // Refresh all data
    const refreshData = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            await Promise.all([
                fetchUserProfile(),
                fetchGlobalStats(),
                fetchCompletedQuests(),
            ])
        } catch (err) {
            setError('Failed to fetch contract data')
        } finally {
            setIsLoading(false)
        }
    }, [fetchUserProfile, fetchGlobalStats, fetchCompletedQuests])

    // Quest execution functions
    const executeQuest = useCallback(async (
        functionName: string,
        args: unknown[] = []
    ): Promise<{ success: boolean; hash?: string; error?: string }> => {
        if (!walletClient || !contract || !isBaseChain(chainId)) {
            return { success: false, error: 'Wallet not connected or unsupported network' }
        }

        setIsLoading(true)
        setError(null)

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const hash = await walletClient.writeContract({
                address: contract.address as Address,
                abi: PULSE_ABI,
                functionName: functionName as any,
                args: args as any,
            })

            // Wait for confirmation
            if (publicClient) {
                await publicClient.waitForTransactionReceipt({ hash })
            }

            // Refresh data after successful transaction
            await refreshData()

            return { success: true, hash }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Transaction failed'
            setError(errorMessage)
            return { success: false, error: errorMessage }
        } finally {
            setIsLoading(false)
        }
    }, [walletClient, contract, chainId, publicClient, refreshData])

    // Individual quest functions
    const dailyCheckin = useCallback(() => executeQuest('dailyCheckin'), [executeQuest])
    const relaySignal = useCallback(() => executeQuest('relaySignal'), [executeQuest])
    const updateAtmosphere = useCallback((weatherCode: number) =>
        executeQuest('updateAtmosphere', [weatherCode]), [executeQuest])
    const nudgeFriend = useCallback((friend: string) =>
        executeQuest('nudgeFriend', [friend]), [executeQuest])
    const commitMessage = useCallback((message: string) =>
        executeQuest('commitMessage', [message]), [executeQuest])
    const predictPulse = useCallback((level: number) =>
        executeQuest('predictPulse', [level]), [executeQuest])
    const claimDailyCombo = useCallback(() => executeQuest('claimDailyCombo'), [executeQuest])

    // Check if combo is available
    const checkComboAvailable = useCallback(async (): Promise<boolean> => {
        if (!address || !publicClient || !contract || !isBaseChain(chainId)) {
            return false
        }

        try {
            const isAvailable = await publicClient.readContract({
                address: contract.address as Address,
                abi: PULSE_ABI,
                functionName: 'isComboAvailable',
                args: [address],
            })

            return isAvailable as boolean
        } catch {
            return false
        }
    }, [address, publicClient, contract, chainId])

    // Initial data fetch
    useEffect(() => {
        if (isConnected && address && isBaseChain(chainId)) {
            refreshData()
        }
    }, [isConnected, address, chainId, refreshData])

    return {
        // State
        userProfile,
        globalStats,
        completedQuests,
        isLoading,
        error,
        contractInfo,

        // Contract info
        isBaseNetwork: isBaseChain(chainId),
        isTestnet: isBaseTestnetChain(chainId),
        contractAddress: contract?.address || null,

        // Actions
        refreshData,
        dailyCheckin,
        relaySignal,
        updateAtmosphere,
        nudgeFriend,
        commitMessage,
        predictPulse,
        claimDailyCombo,
        checkComboAvailable,

        // Helper
        isQuestCompleted: (questId: number) => completedQuests.includes(questId),
    }
}

/**
 * Hook for Stacks contract info (for display purposes)
 * Actual Stacks contract interaction would require @stacks/connect integration
 */
export function useStacksContractInfo(isMainnet: boolean = false) {
    const contract = getStacksContract(isMainnet ? 'mainnet' : 'testnet')

    return {
        contractAddress: contract.contractAddress,
        contractName: contract.contractName,
        fullContractId: contract.fullContractId,
        explorerUrl: contract.explorerUrl,
        apiUrl: contract.apiUrl,
        network: contract.network,
    }
}
