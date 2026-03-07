'use client'

import { useCallback, useEffect, useEffectEvent, useMemo, useState } from 'react'
import { useAccount, useChainId, usePublicClient, useWalletClient } from 'wagmi'
import {
    PULSE_ABI,
    QUEST_IDS,
    getBaseContract,
    isBaseChain,
    isBaseTestnetChain,
} from '@winsznx/sdk'
import type { Address } from 'viem'
import type { ContractInfo, GlobalStats, PulseActionResult, UserProfile } from './types.js'

export interface UseBasePulseContractResult {
    userProfile: UserProfile | null
    globalStats: GlobalStats | null
    completedQuests: number[]
    isLoading: boolean
    error: string | null
    contractInfo: ContractInfo
    isBaseNetwork: boolean
    isTestnet: boolean
    contractAddress: string | null
    refreshData: () => Promise<void>
    dailyCheckin: () => Promise<PulseActionResult>
    relaySignal: () => Promise<PulseActionResult>
    updateAtmosphere: (weatherCode: number) => Promise<PulseActionResult>
    nudgeFriend: (friend: string) => Promise<PulseActionResult>
    commitMessage: (message: string) => Promise<PulseActionResult>
    predictPulse: (level: number) => Promise<PulseActionResult>
    claimDailyCombo: () => Promise<PulseActionResult>
    checkComboAvailable: () => Promise<boolean>
    isQuestCompleted: (questId: number) => boolean
}

export function useBasePulseContract(): UseBasePulseContractResult {
    const { address, isConnected } = useAccount()
    const chainId = useChainId()
    const publicClient = usePublicClient()
    const { data: walletClient } = useWalletClient()

    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
    const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null)
    const [completedQuests, setCompletedQuests] = useState<number[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const contract = useMemo(() => {
        if (!chainId || !isBaseChain(chainId)) {
            return null
        }

        return getBaseContract(chainId)
    }, [chainId])

    const contractInfo = useMemo<ContractInfo>(() => {
        if (!contract) {
            return {
                chainType: 'unknown',
                network: 'testnet',
                contractAddress: '',
                explorerUrl: '',
            }
        }

        return {
            chainType: 'base',
            network: isBaseTestnetChain(chainId) ? 'testnet' : 'mainnet',
            contractAddress: contract.address,
            explorerUrl: contract.explorerUrl,
        }
    }, [chainId, contract])

    const fetchUserProfile = useCallback(async () => {
        if (!address || !publicClient || !contract) {
            return
        }

        const profile = await publicClient.readContract({
            address: contract.address as Address,
            abi: PULSE_ABI,
            functionName: 'getUserProfile',
            args: [address],
        })

        setUserProfile(profile as UserProfile)
    }, [address, contract, publicClient])

    const fetchGlobalStats = useCallback(async () => {
        if (!publicClient || !contract) {
            return
        }

        const data = await publicClient.readContract({
            address: contract.address as Address,
            abi: PULSE_ABI,
            functionName: 'getGlobalStats',
        })

        const [totalUsers, totalCheckins, totalPointsDistributed] = data as [bigint, bigint, bigint]
        setGlobalStats({ totalUsers, totalCheckins, totalPointsDistributed })
    }, [contract, publicClient])

    const fetchCompletedQuests = useCallback(async () => {
        if (!address || !publicClient || !contract) {
            return
        }

        const questIds = Object.values(QUEST_IDS)
        const completed = await Promise.all(
            questIds.map(async (questId) => ({
                questId,
                completed: await publicClient.readContract({
                    address: contract.address as Address,
                    abi: PULSE_ABI,
                    functionName: 'hasCompletedQuestToday',
                    args: [address, questId],
                }),
            })),
        )

        setCompletedQuests(
            completed
                .filter((entry) => Boolean(entry.completed))
                .map((entry) => entry.questId),
        )
    }, [address, contract, publicClient])

    const refreshData = useCallback(async () => {
        if (!contract) {
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            await Promise.all([
                fetchUserProfile(),
                fetchGlobalStats(),
                fetchCompletedQuests(),
            ])
        } catch (refreshError) {
            setError(refreshError instanceof Error ? refreshError.message : 'Failed to fetch contract data')
        } finally {
            setIsLoading(false)
        }
    }, [contract, fetchCompletedQuests, fetchGlobalStats, fetchUserProfile])

    const refreshOnConnect = useEffectEvent(async () => {
        await refreshData()
    })

    useEffect(() => {
        if (!isConnected || !address || !contract) {
            setUserProfile(null)
            setGlobalStats(null)
            setCompletedQuests([])
            setError(null)
            return
        }

        void refreshOnConnect()
    }, [address, contract, isConnected, refreshOnConnect])

    const executeQuest = useCallback(async (
        functionName: string,
        args: unknown[] = [],
    ): Promise<PulseActionResult> => {
        if (!walletClient || !contract) {
            return { success: false, error: 'Wallet not connected or unsupported network' }
        }

        setIsLoading(true)
        setError(null)

        try {
            const hash = await walletClient.writeContract({
                address: contract.address as Address,
                abi: PULSE_ABI,
                functionName: functionName as never,
                args: args as never,
            })

            if (publicClient) {
                await publicClient.waitForTransactionReceipt({ hash })
            }

            await refreshData()

            return { success: true, hash }
        } catch (executionError) {
            const message = executionError instanceof Error ? executionError.message : 'Transaction failed'
            setError(message)
            return { success: false, error: message }
        } finally {
            setIsLoading(false)
        }
    }, [contract, publicClient, refreshData, walletClient])

    const dailyCheckin = useCallback(() => executeQuest('dailyCheckin'), [executeQuest])
    const relaySignal = useCallback(() => executeQuest('relaySignal'), [executeQuest])
    const updateAtmosphere = useCallback((weatherCode: number) => (
        executeQuest('updateAtmosphere', [weatherCode])
    ), [executeQuest])
    const nudgeFriend = useCallback((friend: string) => (
        executeQuest('nudgeFriend', [friend])
    ), [executeQuest])
    const commitMessage = useCallback((message: string) => (
        executeQuest('commitMessage', [message])
    ), [executeQuest])
    const predictPulse = useCallback((level: number) => (
        executeQuest('predictPulse', [level])
    ), [executeQuest])
    const claimDailyCombo = useCallback(() => executeQuest('claimDailyCombo'), [executeQuest])

    const checkComboAvailable = useCallback(async () => {
        if (!address || !publicClient || !contract) {
            return false
        }

        try {
            const available = await publicClient.readContract({
                address: contract.address as Address,
                abi: PULSE_ABI,
                functionName: 'isComboAvailable',
                args: [address],
            })

            return Boolean(available)
        } catch {
            return false
        }
    }, [address, contract, publicClient])

    return {
        userProfile,
        globalStats,
        completedQuests,
        isLoading,
        error,
        contractInfo,
        isBaseNetwork: Boolean(contract),
        isTestnet: isBaseTestnetChain(chainId),
        contractAddress: contract?.address ?? null,
        refreshData,
        dailyCheckin,
        relaySignal,
        updateAtmosphere,
        nudgeFriend,
        commitMessage,
        predictPulse,
        claimDailyCombo,
        checkComboAvailable,
        isQuestCompleted: (questId: number) => completedQuests.includes(questId),
    }
}

export const usePulseContract = useBasePulseContract
