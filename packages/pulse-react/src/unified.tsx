'use client'

import { useAppKitAccount } from '@reown/appkit/react'
import { QUEST_IDS, QUEST_POINTS } from '@winsznx/sdk'
import { useCallback, useMemo } from 'react'
import { useBasePulseContract } from './base.js'
import { usePulseStacks } from './stacks.js'
import type { UnifiedContractInfo, UnifiedUserProfile } from './types.js'
import { hasStacksDailyCombo, normalizeBaseUserProfile, normalizeStacksUserProfile, resolveActivePulseContract } from './utils.js'

export function useUnifiedPulseContract() {
    const { isConnected: isAppKitConnected } = useAppKitAccount()

    const baseContract = useBasePulseContract()
    const stacksContext = usePulseStacks()

    const activeContract = useMemo(() => resolveActivePulseContract({
        stacksConnected: stacksContext.isConnected,
        appKitConnected: isAppKitConnected,
        baseNetwork: baseContract.isBaseNetwork,
    }), [baseContract.isBaseNetwork, isAppKitConnected, stacksContext.isConnected])

    const userProfile: UnifiedUserProfile | null = useMemo(() => {
        if (activeContract === 'base' && baseContract.userProfile) {
            return normalizeBaseUserProfile(baseContract.userProfile)
        }

        if (activeContract === 'stacks' && stacksContext.userProfile) {
            return normalizeStacksUserProfile(stacksContext.userProfile)
        }

        return null
    }, [activeContract, baseContract.userProfile, stacksContext.userProfile])

    const contractInfo: UnifiedContractInfo = useMemo(() => {
        if (activeContract === 'base') {
            return {
                chainType: 'base',
                network: baseContract.isTestnet ? 'testnet' : 'mainnet',
                contractAddress: baseContract.contractAddress ?? '',
                explorerUrl: baseContract.contractInfo.explorerUrl,
            }
        }

        if (activeContract === 'stacks') {
            return {
                chainType: 'stacks',
                network: stacksContext.contractInfo.network,
                contractAddress: stacksContext.contractInfo.contractAddress,
                explorerUrl: stacksContext.contractInfo.explorerUrl,
            }
        }

        return {
            chainType: 'unknown',
            network: 'testnet',
            contractAddress: '',
            explorerUrl: '',
        }
    }, [activeContract, baseContract.contractAddress, baseContract.contractInfo.explorerUrl, baseContract.isTestnet, stacksContext.contractInfo])

    const dailyCheckin = useCallback(async () => {
        if (activeContract === 'base') {
            return baseContract.dailyCheckin()
        }

        if (activeContract === 'stacks') {
            return stacksContext.dailyCheckin()
        }

        return { success: false, error: 'No supported network connected' }
    }, [activeContract, baseContract, stacksContext])

    const relaySignal = useCallback(async () => {
        if (activeContract === 'base') {
            return baseContract.relaySignal()
        }

        if (activeContract === 'stacks') {
            return stacksContext.relaySignal()
        }

        return { success: false, error: 'No supported network connected' }
    }, [activeContract, baseContract, stacksContext])

    const updateAtmosphere = useCallback(async (weatherCode: number) => {
        if (activeContract === 'base') {
            return baseContract.updateAtmosphere(weatherCode)
        }

        if (activeContract === 'stacks') {
            return stacksContext.updateAtmosphere(weatherCode)
        }

        return { success: false, error: 'No supported network connected' }
    }, [activeContract, baseContract, stacksContext])

    const nudgeFriend = useCallback(async (friendAddress: string) => {
        if (activeContract === 'base') {
            return baseContract.nudgeFriend(friendAddress)
        }

        if (activeContract === 'stacks') {
            return stacksContext.nudgeFriend(friendAddress)
        }

        return { success: false, error: 'No supported network connected' }
    }, [activeContract, baseContract, stacksContext])

    const commitMessage = useCallback(async (message: string) => {
        if (activeContract === 'base') {
            return baseContract.commitMessage(message)
        }

        if (activeContract === 'stacks') {
            return stacksContext.commitMessage(message)
        }

        return { success: false, error: 'No supported network connected' }
    }, [activeContract, baseContract, stacksContext])

    const predictPulse = useCallback(async (level: number) => {
        if (activeContract === 'base') {
            return baseContract.predictPulse(level)
        }

        if (activeContract === 'stacks') {
            return stacksContext.predictPulse(level)
        }

        return { success: false, error: 'No supported network connected' }
    }, [activeContract, baseContract, stacksContext])

    const claimDailyCombo = useCallback(async () => {
        if (activeContract === 'base') {
            return baseContract.claimDailyCombo()
        }

        if (activeContract === 'stacks') {
            return stacksContext.claimDailyCombo()
        }

        return { success: false, error: 'No supported network connected' }
    }, [activeContract, baseContract, stacksContext])

    const refreshData = useCallback(async () => {
        if (activeContract === 'base') {
            return baseContract.refreshData()
        }

        if (activeContract === 'stacks') {
            return stacksContext.refreshData()
        }
    }, [activeContract, baseContract, stacksContext])

    const isQuestCompleted = useCallback((questId: number) => {
        if (activeContract === 'base') {
            return baseContract.isQuestCompleted(questId)
        }

        if (activeContract === 'stacks') {
            return stacksContext.isQuestCompleted(questId)
        }

        return false
    }, [activeContract, baseContract, stacksContext])

    const checkComboAvailable = useCallback(async () => {
        if (activeContract === 'base') {
            return baseContract.checkComboAvailable()
        }

        if (activeContract === 'stacks') {
            return hasStacksDailyCombo(stacksContext.userProfile?.questBitmap ?? 0)
        }

        return false
    }, [activeContract, baseContract, stacksContext.userProfile?.questBitmap])

    return {
        isConnected: activeContract !== 'none',
        activeContract,
        chainType: activeContract === 'base' ? 'evm' : activeContract === 'stacks' ? 'stacks' : 'unknown',
        stacksAddress: stacksContext.address,
        contractInfo,
        userProfile,
        globalStats: baseContract.globalStats,
        isLoading: baseContract.isLoading || stacksContext.isLoading,
        error: baseContract.error || stacksContext.error,
        dailyCheckin,
        relaySignal,
        updateAtmosphere,
        nudgeFriend,
        commitMessage,
        predictPulse,
        claimDailyCombo,
        refreshData,
        isQuestCompleted,
        checkComboAvailable,
        baseContract,
        stacksContext,
        QUEST_IDS,
        QUEST_POINTS,
    }
}

export const useUnifiedContract = useUnifiedPulseContract
