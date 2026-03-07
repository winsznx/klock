'use client'

import { useCallback, useMemo } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { usePulseContract } from './usePulseContract'
import { useStacks } from '@/context/StacksContext'
import { QUEST_IDS, QUEST_POINTS } from '@pulseprotocol/sdk'

// Re-export types
export type { UserProfile, GlobalStats, ContractInfo } from './usePulseContract'

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
 * based on the connected wallet
 * 
 * For Base (EVM): Uses AppKit + wagmi hooks
 * For Stacks: Uses @stacks/connect for wallet connection and transactions
 */
export function useUnifiedContract() {
    const { isConnected: isAppKitConnected } = useAppKitAccount()

    // Get both contract systems
    const baseContract = usePulseContract()
    const stacksContext = useStacks()

    // Determine which contract to use
    const activeContract = useMemo(() => {
        // Check if connected with Stacks wallet via @stacks/connect
        if (stacksContext.isConnected) return 'stacks'

        // Check if connected to Base EVM network via AppKit
        if (isAppKitConnected && baseContract.isBaseNetwork) return 'base'

        return 'none'
    }, [stacksContext.isConnected, isAppKitConnected, baseContract.isBaseNetwork])

    // Determine the Stacks address
    const stacksAddress = stacksContext.address

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
        if (activeContract === 'stacks' && stacksContext.userProfile) {
            return {
                totalPoints: stacksContext.userProfile.totalPoints,
                currentStreak: stacksContext.userProfile.currentStreak,
                longestStreak: stacksContext.userProfile.longestStreak,
                level: stacksContext.userProfile.level,
                totalCheckins: stacksContext.userProfile.totalCheckins,
                exists: true,
            }
        }
        return null
    }, [activeContract, baseContract.userProfile, stacksContext.userProfile])

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
                network: stacksContext.contractInfo.network,
                contractAddress: stacksContext.contractInfo.contractAddress,
                explorerUrl: stacksContext.contractInfo.explorerUrl,
            }
        }
        return {
            chainType: 'unknown' as const,
            network: 'testnet' as const,
            contractAddress: '',
            explorerUrl: '',
        }
    }, [activeContract, baseContract, stacksContext])

    // Unified loading state
    const isLoading = baseContract.isLoading || stacksContext.isLoading

    // Unified error state
    const error = baseContract.error || stacksContext.error

    // Unified quest execution - routes to correct contract
    const dailyCheckin = useCallback(async () => {
        if (activeContract === 'base') return baseContract.dailyCheckin()
        if (activeContract === 'stacks') return stacksContext.dailyCheckin()
        return { success: false, error: 'No supported network connected' }
    }, [activeContract, baseContract, stacksContext])

    const relaySignal = useCallback(async () => {
        if (activeContract === 'base') return baseContract.relaySignal()
        if (activeContract === 'stacks') return stacksContext.relaySignal()
        return { success: false, error: 'No supported network connected' }
    }, [activeContract, baseContract, stacksContext])

    const updateAtmosphere = useCallback(async (weatherCode: number) => {
        if (activeContract === 'base') return baseContract.updateAtmosphere(weatherCode)
        if (activeContract === 'stacks') return stacksContext.updateAtmosphere(weatherCode)
        return { success: false, error: 'No supported network connected' }
    }, [activeContract, baseContract, stacksContext])

    const nudgeFriend = useCallback(async (friendAddress: string) => {
        if (activeContract === 'base') return baseContract.nudgeFriend(friendAddress)
        if (activeContract === 'stacks') return stacksContext.nudgeFriend(friendAddress)
        return { success: false, error: 'No supported network connected' }
    }, [activeContract, baseContract, stacksContext])

    const commitMessage = useCallback(async (message: string) => {
        if (activeContract === 'base') return baseContract.commitMessage(message)
        if (activeContract === 'stacks') return stacksContext.commitMessage(message)
        return { success: false, error: 'No supported network connected' }
    }, [activeContract, baseContract, stacksContext])

    const predictPulse = useCallback(async (level: number) => {
        if (activeContract === 'base') return baseContract.predictPulse(level)
        if (activeContract === 'stacks') return stacksContext.predictPulse(level)
        return { success: false, error: 'No supported network connected' }
    }, [activeContract, baseContract, stacksContext])

    const claimDailyCombo = useCallback(async () => {
        if (activeContract === 'base') return baseContract.claimDailyCombo()
        if (activeContract === 'stacks') return stacksContext.claimDailyCombo()
        return { success: false, error: 'No supported network connected' }
    }, [activeContract, baseContract, stacksContext])

    // Unified refresh
    const refreshData = useCallback(async () => {
        if (activeContract === 'base') return baseContract.refreshData()
        if (activeContract === 'stacks') return stacksContext.refreshData()
    }, [activeContract, baseContract, stacksContext])

    // Check if quest is completed
    const isQuestCompleted = useCallback((questId: number): boolean => {
        if (activeContract === 'base') return baseContract.isQuestCompleted(questId)
        if (activeContract === 'stacks') return stacksContext.isQuestCompleted(questId)
        return false
    }, [activeContract, baseContract, stacksContext])

    // Check combo availability
    const checkComboAvailable = useCallback(async (): Promise<boolean> => {
        if (activeContract === 'base') return baseContract.checkComboAvailable()
        // For Stacks, check locally based on completed quests
        if (activeContract === 'stacks') {
            const hasCheckin = stacksContext.isQuestCompleted(QUEST_IDS.DAILY_CHECKIN)
            const hasAtmosphere = stacksContext.isQuestCompleted(QUEST_IDS.UPDATE_ATMOSPHERE)
            const hasMessage = stacksContext.isQuestCompleted(QUEST_IDS.COMMIT_MESSAGE)
            return hasCheckin && hasAtmosphere && hasMessage
        }
        return false
    }, [activeContract, baseContract, stacksContext])

    return {
        // Connection state
        isConnected: activeContract !== 'none',
        activeContract,
        chainType: activeContract === 'base' ? 'evm' : activeContract === 'stacks' ? 'stacks' : 'unknown',

        // Stacks address
        stacksAddress,

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

        // Raw contract instances (for advanced use)
        baseContract,
        stacksContext,

        // Quest metadata
        QUEST_IDS,
        QUEST_POINTS,
    }
}
