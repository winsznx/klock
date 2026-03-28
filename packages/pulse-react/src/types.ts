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

import type {
    StacksUserProfile as SDKStacksUserProfile,
    StacksContractConfig as SDKStacksContractConfig,
} from '@winsznx/sdk'

export interface StacksUserProfile extends SDKStacksUserProfile {}
export interface StacksContractInfo extends SDKStacksContractConfig {}

export interface UnifiedUserProfile {
    totalPoints: number
    currentStreak: number
    longestStreak: number
    level: number
    totalCheckins: number
    questBitmap: number
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

