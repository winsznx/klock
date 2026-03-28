import type { Address } from 'viem'

export type PulseNetwork = 'mainnet' | 'testnet'
export type PulseBaseNetwork = PulseNetwork
export type PulseStacksNetwork = PulseNetwork
export type PulseQuestId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
export type SupportedBaseChainId = 8453 | 84532

export interface BaseContractConfig {
    chainId: SupportedBaseChainId
    address: Address
    explorerUrl: string
    rpcUrl: string
}

export interface StacksContractConfig {
    network: PulseStacksNetwork
    contractAddress: string
    contractName: string
    fullContractId: string
    explorerUrl: string
    apiUrl: string
}

export interface BaseUserProfile {
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

export interface BaseGlobalStats {
    totalUsers: bigint
    totalCheckins: bigint
    totalPointsDistributed: bigint
}

export interface StacksUserProfile {
    totalPoints: number
    currentStreak: number
    longestStreak: number
    lastCheckinBlock: number
    totalCheckins: number
    level: number
    exists: boolean
}

export interface StacksDailyQuestStatus {
    completedQuests: number
    firstQuestBlock: number
    comboActivated: boolean
    exists: boolean
}

export interface StacksReadOnlyResponse {
    okay: boolean
    result: string
    cause?: string | undefined
    error?: string | undefined
}
export type PulseContractFunction =
| 'dailyCheckin'
| 'relaySignal'
| 'updateAtmosphere'
| 'nudgeFriend'
| 'commitMessage'
| 'predictPulse'
| 'claimDailyCombo'
| 'getUserProfile'
| 'getGlobalStats'
| 'hasCompletedQuestToday'
| 'isComboAvailable'
| 'getCurrentDay'

