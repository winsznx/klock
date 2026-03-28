'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { connect, request, isConnected as hasStacksConnection, disconnect as stacksDisconnect, getLocalStorage } from '@stacks/connect'
import { principalCV, stringUtf8CV, uintCV } from '@stacks/transactions'
import {
    getStacksContract,
    getStacksContractByAddress,
    isStacksMainnetAddress,
    isStacksQuestCompleted,
    readStacksCurrentDay,
    readStacksDailyQuestStatus,
    readStacksUserProfile,
    readStacksGlobalStats,
    type PulseQuestId,
} from '@winsznx/sdk'
import type { GlobalStats, PulseActionResult, StacksContractInfo, StacksUserProfile } from './types.js'

export interface PulseStacksContextValue {
    isConnected: boolean
    address: string | null
    isMainnet: boolean
    connect: () => Promise<void>
    disconnect: () => void
    contractInfo: StacksContractInfo
    userProfile: StacksUserProfile | null
    isLoading: boolean
    error: string | null
    dailyCheckin: () => Promise<PulseActionResult>
    relaySignal: () => Promise<PulseActionResult>
    updateAtmosphere: (weatherCode: number) => Promise<PulseActionResult>
    nudgeFriend: (friendAddress: string) => Promise<PulseActionResult>
    commitMessage: (message: string) => Promise<PulseActionResult>
    predictPulse: (level: number) => Promise<PulseActionResult>
    claimDailyCombo: () => Promise<PulseActionResult>
    refreshData: () => Promise<void>
    isQuestCompleted: (questId: number) => boolean
    globalStats: GlobalStats | null
}

const PulseStacksContext = createContext<PulseStacksContextValue | undefined>(undefined)

export async function fetchStacksWalletProfile(address: string): Promise<StacksUserProfile | null> {
    const network = isStacksMainnetAddress(address) ? 'mainnet' : 'testnet'

    try {
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
    } catch (error) {
        console.error('[PULSE][Stacks] Failed to fetch profile', error)
        return null
    }
}

interface PulseStacksProviderProps {
    children: ReactNode
}

export function PulseStacksProvider({ children }: PulseStacksProviderProps) {
    const [connected, setConnected] = useState<boolean>(false)
    const [address, setAddress] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [userProfile, setUserProfile] = useState<StacksUserProfile | null>(null)
    const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null)

    const isMainnet = isStacksMainnetAddress(address)
    const contractInfo = useMemo<StacksContractInfo>(() => {
        const contract = getStacksContractByAddress(address)
        return {
            contractAddress: contract.contractAddress,
            contractName: contract.contractName,
            explorerUrl: contract.explorerUrl,
            fullContractId: contract.fullContractId,
            network: isMainnet ? 'mainnet' : 'testnet',
        }
    }, [address, isMainnet])

    useEffect(() => {
        const checkConnection = async () => {
             const storage = getLocalStorage()
             const connectedOnStorage = hasStacksConnection()
             const stxAddress = storage?.addresses?.stx?.[0]?.address

             if (connectedOnStorage && stxAddress) {
                 setAddress(stxAddress)
                 setConnected(true)
             }
        }
        checkConnection()
    }, [])

    const refreshData = useCallback(async () => {
        if (!address || !connected) {
            return
        }

        try {
            setIsLoading(true)
            const [profile, stats] = await Promise.all([
                fetchStacksWalletProfile(address),
                readStacksGlobalStats({ network: isMainnet ? 'mainnet' : 'testnet', sender: address }),
            ])
            setUserProfile(profile)
            setGlobalStats(stats)
        } catch (refreshError) {
            console.error('[PULSE][Stacks] Failed to refresh profile', refreshError)
            setError(refreshError instanceof Error ? refreshError.message : 'Failed to refresh Stacks profile')
        } finally {
            setIsLoading(false)
        }
    }, [address, connected])

    useEffect(() => {
        if (!connected || !address) {
            setUserProfile(null)
            return
        }

        void refreshData()
    }, [address, connected, refreshData])

    const connectWallet = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)

            const result = await connect()
            const stxAddress = result.addresses.find((candidate) => candidate.symbol === 'STX')?.address

            if (stxAddress) {
                setAddress(stxAddress)
                setConnected(true)
            }
        } catch (connectError) {
            setError(connectError instanceof Error ? connectError.message : 'Failed to connect')
        } finally {
            setIsLoading(false)
        }
    }, [])

    const disconnectWallet = useCallback(() => {
        stacksDisconnect()
        setAddress(null)
        setConnected(false)
        setUserProfile(null)
        setGlobalStats(null)
        setError(null)
    }, [])

    const executeContractCall = useCallback(async (
        functionName: string,
        functionArgs: unknown[] = [],
    ): Promise<PulseActionResult> => {
        if (!connected || !address) {
            return { success: false, error: 'Stacks wallet not connected' }
        }

        try {
            setIsLoading(true)
            setError(null)

            const requestContractCall = request as unknown as (
                method: string,
                params: unknown,
            ) => Promise<{ txid?: string }>

            const result = await requestContractCall('stx_callContract', {
                contract: contractInfo.fullContractId,
                functionName,
                functionArgs,
            })

            return { success: true, txId: result.txid }
        } catch (callError) {
            const message = callError instanceof Error ? callError.message : 'Transaction failed'
            setError(message)
            return { success: false, error: message }
        } finally {
            setIsLoading(false)
        }
    }, [address, connected, contractInfo.fullContractId])

    const dailyCheckin = useCallback(() => executeContractCall('daily-checkin', []), [executeContractCall])
    const relaySignal = useCallback(() => executeContractCall('relay-signal', []), [executeContractCall])
    const updateAtmosphere = useCallback((weatherCode: number) => (
        executeContractCall('update-atmosphere', [uintCV(weatherCode)])
    ), [executeContractCall])
    const nudgeFriend = useCallback((friendAddress: string) => (
        executeContractCall('nudge-friend', [principalCV(friendAddress)])
    ), [executeContractCall])
    const commitMessage = useCallback((message: string) => (
        executeContractCall('commit-message', [stringUtf8CV(message)])
    ), [executeContractCall])
    const predictPulse = useCallback((level: number) => (
        executeContractCall('predict-pulse', [uintCV(level)])
    ), [executeContractCall])
    const claimDailyCombo = useCallback(() => (
        executeContractCall('claim-daily-combo-bonus', [])
    ), [executeContractCall])

    const isQuestCompleted = useCallback((questId: number) => {
        if (!userProfile) {
            return false
        }

        return isStacksQuestCompleted(userProfile.questBitmap, questId as PulseQuestId)
    }, [userProfile])

    const value = useMemo<PulseStacksContextValue>(() => ({
        isConnected: connected,
        address,
        isMainnet,
        connect: connectWallet,
        disconnect: disconnectWallet,
        contractInfo,
        userProfile,
        isLoading,
        error,
        dailyCheckin,
        relaySignal,
        updateAtmosphere,
        nudgeFriend,
        commitMessage,
        predictPulse,
        claimDailyCombo,
        refreshData,
        isQuestCompleted,
        globalStats,
    }), [
        address,
        claimDailyCombo,
        commitMessage,
        connectWallet,
        connected,
        contractInfo,
        dailyCheckin,
        disconnectWallet,
        error,
        globalStats,
        isLoading,
        isMainnet,
        isQuestCompleted,
        nudgeFriend,
        predictPulse,
        refreshData,
        relaySignal,
        updateAtmosphere,
        userProfile,
    ])

    return (
        <PulseStacksContext.Provider value={value}>
            {children}
        </PulseStacksContext.Provider>
    )
}

export function usePulseStacks() {
    const context = useContext(PulseStacksContext)
    if (!context) {
        throw new Error('usePulseStacks must be used within a PulseStacksProvider')
    }

    return context
}

export function useStacksContractInfo(isMainnet = false): StacksContractInfo {
    const contract = getStacksContract(isMainnet ? 'mainnet' : 'testnet')

    return {
        contractAddress: contract.contractAddress,
        contractName: contract.contractName,
        explorerUrl: contract.explorerUrl,
        fullContractId: contract.fullContractId,
        network: contract.network,
    }
}

export const StacksProvider = PulseStacksProvider
export const useStacks = usePulseStacks

