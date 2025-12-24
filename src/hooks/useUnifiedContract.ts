'use client'

import { useCallback, useMemo } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { usePulseContract } from './usePulseContract'
import { useStacksContract, useMultiChainContract } from './useStacksContract'
import { QUEST_IDS, QUEST_POINTS } from '@/config/contracts'

// Re-export types
export type { UserProfile, GlobalStats, ContractInfo } from './usePulseContract'
export type { StacksUserProfile, StacksContractInfo } from './useStacksContract'

// Unified user profile type
export interface UnifiedUserProfile {
    totalPoints: number
    currentStreak: number
    longestStreak: number
    level: number
    totalCheckins: number
    exists: boolean
}

// Unified contract info
export interface UnifiedContractInfo {
    chainType: 'base' | 'stacks' | 'unknown'
    network: 'testnet' | 'mainnet'
    contractAddress: string
    explorerUrl: string
}

/**
 * Unified hook that automatically routes to the correct contract (Base or Stacks)
 * based on the connected wallet's network
 * 
 * Usage:
 * const { dailyCheckin, userProfile, chainType } = useUnifiedContract()
 * 
 * The hook will automatically call the correct contract method based on whether
 * the user is connected to Base (EVM) or Stacks network.
 */
export function useUnifiedContract() {
    const { caipAddress, isConnected } = useAppKitAccount()
    const { chainType, isStacks, isEVM } = useMultiChainContract()

    // Get both contract hooks
    const baseContract = usePulseContract()
    const stacksContract = useStacksContract()

    // Determine which contract to use based on connected network
    const activeContract = useMemo(() => {
        if (isStacks) return 'stacks'
        if (isEVM && baseContract.isBaseNetwork) return 'base'
        return 'none'
    }, [isStacks, isEVM, baseContract.isBaseNetwork])

    // Unified user profile
    const userProfile: UnifiedUserProfile | null = useMemo(() => {
        if (activeContract === 'base' && baseContract.userProfile) {
            return {
                totalPoints: Number(baseContract.userProfile.totalPoints),
                currentStreak: Number(baseContract.userProfile.currentStreak),
                longestStreak: Number(baseContract.userProfile.longestStreak),
                level: Number(baseContract.userProfile.level),
                totalCheckins: Number(baseContract.userProfile.totalCheckins),
                exists: baseContract.userProfile.exists,
            }
        }
        if (activeContract === 'stacks' && stacksContract.userProfile) {
            return {
                totalPoints: stacksContract.userProfile.totalPoints,
                currentStreak: stacksContract.userProfile.currentStreak,
                longestStreak: stacksContract.userProfile.longestStreak,
                level: stacksContract.userProfile.level,
                totalCheckins: stacksContract.userProfile.totalCheckins,
                exists: true,
            }
        }
        return null
    }, [activeContract, baseContract.userProfile, stacksContract.userProfile])

    // Unified contract info
    const contractInfo: UnifiedContractInfo = useMemo(() => {
        if (activeContract === 'base') {
            return {
                chainType: 'base' as const,
                network: baseContract.isTestnet ? 'testnet' as const : 'mainnet' as const,
                contractAddress: baseContract.contractAddress || '',
                explorerUrl: baseContract.contractInfo.explorerUrl,
            }
        }
        if (activeContract === 'stacks') {
            return {
                chainType: 'stacks' as const,
                network: stacksContract.contractInfo.network,
                contractAddress: stacksContract.contractInfo.contractAddress,
                explorerUrl: stacksContract.contractInfo.explorerUrl,
            }
        }
        return {
            chainType: 'unknown' as const,
            network: 'testnet' as const,
            contractAddress: '',
            explorerUrl: '',
        }
    }, [activeContract, baseContract, stacksContract])

    // Unified loading state
    const isLoading = baseContract.isLoading || stacksContract.isLoading

    // Unified error state
    const error = baseContract.error || stacksContract.error

    // Unified quest execution - routes to correct contract
    const dailyCheckin = useCallback(async () => {
        if (activeContract === 'base') return baseContract.dailyCheckin()
        if (activeContract === 'stacks') return stacksContract.dailyCheckin()
        return { success: false, error: 'No supported network connected' }
    }, [activeContract, baseContract.dailyCheckin, stacksContract.dailyCheckin])

    const relaySignal = useCallback(async () => {
        if (activeContract === 'base') return baseContract.relaySignal()
        if (activeContract === 'stacks') return stacksContract.relaySignal()
        return { success: false, error: 'No supported network connected' }
    }, [activeContract, baseContract.relaySignal, stacksContract.relaySignal])

    const updateAtmosphere = useCallback(async (weatherCode: number) => {
        if (activeContract === 'base') return baseContract.updateAtmosphere(weatherCode)
        if (activeContract === 'stacks') return stacksContract.updateAtmosphere(weatherCode)
        return { success: false, error: 'No supported network connected' }
    }, [activeContract, baseContract.updateAtmosphere, stacksContract.updateAtmosphere])

    const nudgeFriend = useCallback(async (friendAddress: string) => {
        if (activeContract === 'base') return baseContract.nudgeFriend(friendAddress)
        if (activeContract === 'stacks') return stacksContract.nudgeFriend(friendAddress)
        return { success: false, error: 'No supported network connected' }
    }, [activeContract, baseContract.nudgeFriend, stacksContract.nudgeFriend])

    const commitMessage = useCallback(async (message: string) => {
        if (activeContract === 'base') return baseContract.commitMessage(message)
        if (activeContract === 'stacks') return stacksContract.commitMessage(message)
        return { success: false, error: 'No supported network connected' }
    }, [activeContract, baseContract.commitMessage, stacksContract.commitMessage])

    const predictPulse = useCallback(async (level: number) => {
        if (activeContract === 'base') return baseContract.predictPulse(level)
        if (activeContract === 'stacks') return stacksContract.predictPulse(level)
        return { success: false, error: 'No supported network connected' }
    }, [activeContract, baseContract.predictPulse, stacksContract.predictPulse])

    const claimDailyCombo = useCallback(async () => {
        if (activeContract === 'base') return baseContract.claimDailyCombo()
        if (activeContract === 'stacks') return stacksContract.claimDailyCombo()
        return { success: false, error: 'No supported network connected' }
    }, [activeContract, baseContract.claimDailyCombo, stacksContract.claimDailyCombo])

    // Unified refresh
    const refreshData = useCallback(async () => {
        if (activeContract === 'base') return baseContract.refreshData()
        if (activeContract === 'stacks') return stacksContract.refreshData()
    }, [activeContract, baseContract.refreshData, stacksContract.refreshData])

    // Check if quest is completed
    const isQuestCompleted = useCallback((questId: number): boolean => {
        if (activeContract === 'base') return baseContract.isQuestCompleted(questId)
        if (activeContract === 'stacks') return stacksContract.isQuestCompleted(questId)
        return false
    }, [activeContract, baseContract.isQuestCompleted, stacksContract.isQuestCompleted])

    // Check combo availability
    const checkComboAvailable = useCallback(async (): Promise<boolean> => {
        if (activeContract === 'base') return baseContract.checkComboAvailable()
        // For Stacks, check locally based on completed quests
        if (activeContract === 'stacks') {
            const hasCheckin = stacksContract.isQuestCompleted(QUEST_IDS.DAILY_CHECKIN)
            const hasAtmosphere = stacksContract.isQuestCompleted(QUEST_IDS.UPDATE_ATMOSPHERE)
            const hasMessage = stacksContract.isQuestCompleted(QUEST_IDS.COMMIT_MESSAGE)
            return hasCheckin && hasAtmosphere && hasMessage
        }
        return false
    }, [activeContract, baseContract.checkComboAvailable, stacksContract.isQuestCompleted])

    return {
        // Connection state
        isConnected,
        activeContract,
        chainType,

        // Contract info
        contractInfo,

        // User data
        userProfile,
        globalStats: baseContract.globalStats, // Only available on Base for now

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
        checkComboAvailable,

        // Raw contract hooks (for advanced use)
        baseContract,
        stacksContract,

        // Quest metadata
        QUEST_IDS,
        QUEST_POINTS,
    }
}
