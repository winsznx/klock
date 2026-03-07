'use client'

import { modal, useAppKitAccount } from '@reown/appkit/react'
import { useCallback, useMemo, useState } from 'react'
import {
    getStacksContractByAddress,
    isStacksAddress,
    isStacksMainnetAddress,
    isStacksQuestCompleted,
    type PulseQuestId,
} from '@winsznx/sdk'
import type { PulseActionResult, StacksContractInfo, StacksUserProfile } from './types.js'
import { fetchStacksWalletProfile } from './stacks.js'

function resolveStacksChainId(session: { namespaces?: Record<string, { accounts?: string[] }> }) {
    const stacksNamespace = session.namespaces?.stacks
    if (stacksNamespace?.accounts?.length) {
        const [namespace, reference] = stacksNamespace.accounts[0].split(':')
        if (namespace && reference) {
            return `${namespace}:${reference}`
        }
    }

    const bip122Namespace = session.namespaces?.bip122
    if (bip122Namespace?.accounts?.length) {
        const [namespace, reference] = bip122Namespace.accounts[0].split(':')
        if (namespace && reference) {
            return `${namespace}:${reference}`
        }
    }

    return undefined
}

export function useAppKitStacksWallet() {
    const { address, isConnected } = useAppKitAccount()

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [userProfile, setUserProfile] = useState<StacksUserProfile | null>(null)

    const isStacksConnected = isConnected && isStacksAddress(address)
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

    const executeContractCall = useCallback(async (
        functionName: string,
        functionArgs: string[] = [],
    ): Promise<PulseActionResult> => {
        if (!isStacksConnected || !address) {
            return { success: false, error: 'Stacks wallet not connected' }
        }

        if (!modal) {
            return { success: false, error: 'AppKit not initialized' }
        }

        try {
            setIsLoading(true)
            setError(null)

            const universalProvider = await modal.getUniversalProvider()
            if (!universalProvider) {
                throw new Error('Universal Provider not available')
            }

            const targetChainId = resolveStacksChainId(universalProvider.session ?? {})
            const requestPayload = {
                method: 'stx_callContract',
                params: {
                    contract: contractInfo.fullContractId,
                    functionName,
                    functionArgs,
                },
            }

            const result = targetChainId
                ? await universalProvider.request(requestPayload, targetChainId)
                : await universalProvider.request(requestPayload)

            const transaction = result as { txid?: string; transaction?: string }
            return { success: true, txId: transaction.txid ?? transaction.transaction }
        } catch (callError) {
            const message = callError instanceof Error ? callError.message : 'Transaction failed'
            setError(message)
            return { success: false, error: message }
        } finally {
            setIsLoading(false)
        }
    }, [address, contractInfo.fullContractId, isStacksConnected])

    const refreshData = useCallback(async () => {
        if (!address || !isStacksConnected) {
            return
        }

        try {
            setIsLoading(true)
            const profile = await fetchStacksWalletProfile(address)
            setUserProfile(profile)
        } catch (refreshError) {
            setError(refreshError instanceof Error ? refreshError.message : 'Failed to fetch Stacks profile')
        } finally {
            setIsLoading(false)
        }
    }, [address, isStacksConnected])

    const isQuestCompleted = useCallback((questId: number) => {
        if (!userProfile) {
            return false
        }

        return isStacksQuestCompleted(userProfile.questBitmap, questId as PulseQuestId)
    }, [userProfile])

    return {
        address,
        contractInfo,
        userProfile,
        isLoading,
        error,
        isStacksConnected,
        isMainnet,
        dailyCheckin: useCallback(() => executeContractCall('daily-checkin'), [executeContractCall]),
        relaySignal: useCallback(() => executeContractCall('relay-signal'), [executeContractCall]),
        updateAtmosphere: useCallback((weatherCode: number) => executeContractCall('update-atmosphere', [`u${weatherCode}`]), [executeContractCall]),
        nudgeFriend: useCallback((friendAddress: string) => executeContractCall('nudge-friend', [`'${friendAddress}`]), [executeContractCall]),
        commitMessage: useCallback((message: string) => executeContractCall('commit-message', [`"${message}"`]), [executeContractCall]),
        predictPulse: useCallback((level: number) => executeContractCall('predict-pulse', [`u${level}`]), [executeContractCall]),
        claimDailyCombo: useCallback(() => executeContractCall('claim-daily-combo-bonus'), [executeContractCall]),
        refreshData,
        isQuestCompleted,
    }
}

export const useStacksWallet = useAppKitStacksWallet
