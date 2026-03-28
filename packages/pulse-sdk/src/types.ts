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
    /** The name of the contract */
    contractName: string
    /** The fully qualified contract identifier (address.name) */
    fullContractId: string
    /** URL for the block explorer */
    explorerUrl: string
    /** API endpoint for Stacks node interaction */
    apiUrl: string
}

/**
 * Represents a user profile on the Base network
 */
export interface BaseUserProfile {
    /** Total Pulse Points accumulated */
    totalPoints: bigint
    /** Current consecutive daily active streak */
    currentStreak: bigint
    /** Record for the longest consecutive streak */
    longestStreak: bigint
    /** Unix timestamp of the last check-in ritual */
    lastCheckinTime: bigint
    /** Total number of check-in rituals performed */
    totalCheckins: bigint
    /** Current level based on points */
    level: bigint
    /** Current amount staked to protect streaks */
    stakedAmount: bigint
    /** Unix timestamp of when the user joined the protocol */
    joinedTime: bigint
    /** True if the user has a profile record on-chain */
    exists: boolean
}

/**
 * Represents global statistics for the Base protocol
 */
export interface BaseGlobalStats {
    /** Total number of registered users across all time */
    totalUsers: bigint
    /** Aggregate count of all ritual interactions */
    totalCheckins: bigint
    /** Sum of all Pulse Points distributed to users */
    totalPointsDistributed: bigint
}

/**
 * Represents a user profile on the Stacks network
 */
export interface StacksUserProfile {
    /** Total Pulse Points accumulated */
    totalPoints: number
    /** Current consecutive daily active streak */
    currentStreak: number
    /** Record for the longest consecutive streak */
    longestStreak: number
    /** Block height of the last check-in ritual */
    lastCheckinBlock: number
    /** Total number of check-in rituals performed */
    totalCheckins: number
    /** Current level based on points */
    level: number
    /** True if the user has a profile record on-chain */
    exists: boolean
}

/**
 * Status of daily quests for a user on Stacks
 */
export interface StacksDailyQuestStatus {
    /** Bitmask or count of completed quests */
    completedQuests: number
    /** Block height when the first quest was completed */
    firstQuestBlock: number
    /** Whether the daily combo bonus is active */
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

