import type { BaseGlobalStats, BaseUserProfile } from '@winsznx/sdk'

export type PulseContractTarget = 'base' | 'stacks' | 'none'

export interface PulseActionResult {
    success: boolean
    hash?: string
    txId?: string
    error?: string
}

export interface ContractInfo {
    chainType: 'base' | 'stacks' | 'unknown'
    network: 'testnet' | 'mainnet'
    contractAddress: string
    explorerUrl: string
}

export interface UserProfile extends BaseUserProfile {}

export interface GlobalStats extends BaseGlobalStats {}

export interface StacksUserProfile {
    totalPoints: number
    currentStreak: number
    longestStreak: number
    lastCheckinDay: number
    questBitmap: number
    level: number
    totalCheckins: number
}

export interface StacksContractInfo {
    network: 'testnet' | 'mainnet'
    contractAddress: string
    contractName: string
    fullContractId: string
    explorerUrl: string
}

export interface UnifiedUserProfile {
    totalPoints: number
    currentStreak: number
    longestStreak: number
    level: number
    totalCheckins: number
    exists: boolean
}

export interface UnifiedContractInfo extends ContractInfo {}

export interface PulseAuthContextValue {
    isLoggedIn: boolean
    isConnected: boolean
    address: string | undefined
    login: () => void
    logout: () => void
    storageKey: string
}

