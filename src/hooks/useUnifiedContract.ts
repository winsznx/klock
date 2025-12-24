'use client'

import { useCallback, useMemo } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { usePulseContract } from './usePulseContract'
import { useStacks } from '@/context/StacksContext'
import { QUEST_IDS, QUEST_POINTS, STACKS_CONTRACTS } from '@/config/contracts'

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
 * Unified hook that automatically routes to the correct contract (Base or Stacks)
 * based on the connected wallet's network
 * 
 * For Base (EVM): Uses AppKit + wagmi hooks
 * For Stacks: Detects SP/ST address from AppKit and executes via @stacks/connect
 */
export function useUnifiedContract() {
    const { isConnected: isAppKitConnected, address: appKitAddress } = useAppKitAccount()

    // Get both contract systems
    const baseContract = usePulseContract()
    const stacksContract = useStacks()

    // Detect if AppKit connected a Stacks address
    const isStacksFromAppKit = isAppKitConnected && isStacksAddress(appKitAddress)
    const isStacksMainnetFromAppKit = isStacksFromAppKit && isStacksMainnet(appKitAddress)

    // Determine which contract to use
    // Priority: 
    // 1. StacksContext if connected via @stacks/connect
    // 2. Stacks if AppKit connected with SP/ST address
    // 3. Base if AppKit connected with EVM address on Base network
    const activeContract = useMemo(() => {
        // First check StacksContext (connected via @stacks/connect)
        if (stacksContract.isConnected) return 'stacks'

        // Check if AppKit connected with a Stacks address
        if (isStacksFromAppKit) return 'stacks'

        // Check if connected to Base EVM network
        if (isAppKitConnected && baseContract.isBaseNetwork) return 'base'

        return 'none'
    }, [stacksContract.isConnected, isStacksFromAppKit, isAppKitConnected, baseContract.isBaseNetwork])

    // Determine the Stacks address to use
    const stacksAddress = stacksContract.address || (isStacksFromAppKit ? appKitAddress : null)

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
            // Use StacksContext info if available, otherwise derive from AppKit address
            if (stacksContract.isConnected) {
                return {
                    chainType: 'stacks' as const,
                    network: stacksContract.contractInfo.network,
                    contractAddress: stacksContract.contractInfo.contractAddress,
                    explorerUrl: stacksContract.contractInfo.explorerUrl,
                }
            }
            // Derive from AppKit Stacks address
            const isMainnet = isStacksMainnetFromAppKit
            const contract = isMainnet ? STACKS_CONTRACTS.mainnet : STACKS_CONTRACTS.testnet
            return {
                chainType: 'stacks' as const,
                network: isMainnet ? 'mainnet' as const : 'testnet' as const,
                contractAddress: contract.contractAddress,
                explorerUrl: contract.explorerUrl,
            }
        }
        return {
            chainType: 'unknown' as const,
            network: 'testnet' as const,
            contractAddress: '',
            explorerUrl: '',
        }
    }, [activeContract, baseContract, stacksContract, isStacksMainnetFromAppKit])

    // Unified loading state
    const isLoading = baseContract.isLoading || stacksContract.isLoading

    // Unified error state
    const error = baseContract.error || stacksContract.error

    // Unified quest execution - routes to correct contract
    // For Stacks: Pass the address from AppKit so StacksContext can use it
    const dailyCheckin = useCallback(async () => {
        if (activeContract === 'base') return baseContract.dailyCheckin()
        if (activeContract === 'stacks') {
            // Pass stacksAddress (from AppKit or StacksContext) to enable transactions
            return stacksContract.dailyCheckin(stacksAddress || undefined)
        }
        return { success: false, error: 'No supported network connected' }
    }, [activeContract, baseContract, stacksContract, stacksAddress])

    const relaySignal = useCallback(async () => {
        if (activeContract === 'base') return baseContract.relaySignal()
        if (activeContract === 'stacks') return stacksContract.relaySignal(stacksAddress || undefined)
        return { success: false, error: 'No supported network connected' }
    }, [activeContract, baseContract, stacksContract, stacksAddress])

    const updateAtmosphere = useCallback(async (weatherCode: number) => {
        if (activeContract === 'base') return baseContract.updateAtmosphere(weatherCode)
        if (activeContract === 'stacks') return stacksContract.updateAtmosphere(weatherCode, stacksAddress || undefined)
        return { success: false, error: 'No supported network connected' }
    }, [activeContract, baseContract, stacksContract, stacksAddress])

    const nudgeFriend = useCallback(async (friendAddress: string) => {
        if (activeContract === 'base') return baseContract.nudgeFriend(friendAddress)
        if (activeContract === 'stacks') return stacksContract.nudgeFriend(friendAddress, stacksAddress || undefined)
        return { success: false, error: 'No supported network connected' }
    }, [activeContract, baseContract, stacksContract, stacksAddress])

    const commitMessage = useCallback(async (message: string) => {
        if (activeContract === 'base') return baseContract.commitMessage(message)
        if (activeContract === 'stacks') return stacksContract.commitMessage(message, stacksAddress || undefined)
        return { success: false, error: 'No supported network connected' }
    }, [activeContract, baseContract, stacksContract, stacksAddress])

    const predictPulse = useCallback(async (level: number) => {
        if (activeContract === 'base') return baseContract.predictPulse(level)
        if (activeContract === 'stacks') return stacksContract.predictPulse(level, stacksAddress || undefined)
        return { success: false, error: 'No supported network connected' }
    }, [activeContract, baseContract, stacksContract, stacksAddress])

    const claimDailyCombo = useCallback(async () => {
        if (activeContract === 'base') return baseContract.claimDailyCombo()
        if (activeContract === 'stacks') return stacksContract.claimDailyCombo(stacksAddress || undefined)
        return { success: false, error: 'No supported network connected' }
    }, [activeContract, baseContract, stacksContract, stacksAddress])

    // Unified refresh
    const refreshData = useCallback(async () => {
        if (activeContract === 'base') return baseContract.refreshData()
        if (activeContract === 'stacks') return stacksContract.refreshData()
    }, [activeContract, baseContract, stacksContract])

    // Check if quest is completed
    const isQuestCompleted = useCallback((questId: number): boolean => {
        if (activeContract === 'base') return baseContract.isQuestCompleted(questId)
        if (activeContract === 'stacks') return stacksContract.isQuestCompleted(questId)
        return false
    }, [activeContract, baseContract, stacksContract])

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
    }, [activeContract, baseContract, stacksContract])

    // Connect Stacks wallet for signing (when AppKit detected Stacks address)
    const connectStacksForSigning = stacksContract.connectWallet

    return {
        // Connection state
        isConnected: activeContract !== 'none',
        activeContract,
        chainType: activeContract === 'base' ? 'evm' : activeContract === 'stacks' ? 'stacks' : 'unknown',

        // Stacks address (from either AppKit or StacksContext)
        stacksAddress,
        connectStacksForSigning,

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
        stacksContract,

        // Quest metadata
        QUEST_IDS,
        QUEST_POINTS,
    }
}
