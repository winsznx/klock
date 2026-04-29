import { createPublicClient, http, type Address, type PublicClient } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { BASE_CONTRACTS, PULSE_ABI, QUEST_IDS } from './constants.js'
import type {
    BaseContractConfig,
    BaseGlobalStats,
    BaseUserProfile,
    PulseBaseNetwork,
    PulseQuestId,
    SupportedBaseChainId,
} from './types.js'

export interface BaseReadOptions {
    client?: PublicClient
    network?: PulseBaseNetwork
}

export function isBaseChain(chainId: number | undefined): chainId is SupportedBaseChainId {
    return chainId === BASE_CONTRACTS.mainnet.chainId || chainId === BASE_CONTRACTS.testnet.chainId
}

export function isBaseTestnetChain(chainId: number | undefined | null): boolean {
    return chainId === BASE_CONTRACTS.testnet.chainId
}

const UNSUPPORTED_CHAIN_MSG = 'Unsupported Base chain ID'

export function getBaseContract(chainId: number): BaseContractConfig {
    if (chainId === BASE_CONTRACTS.mainnet.chainId) {
        return BASE_CONTRACTS.mainnet
    }

    if (chainId === BASE_CONTRACTS.testnet.chainId) {
        return BASE_CONTRACTS.testnet
    }

    throw new Error(`${UNSUPPORTED_CHAIN_MSG}: ${chainId}`)
}

export function getBaseContractByNetwork(network: PulseBaseNetwork = 'mainnet'): BaseContractConfig {
    return BASE_CONTRACTS[network]
}

export function createBasePublicClient (network: PulseBaseNetwork = 'mainnet') {
    return createPublicClient({
        chain: network === 'mainnet' ? base : baseSepolia,
        transport: http(BASE_CONTRACTS[network].rpcUrl),
    })
}

function resolveBaseClient (options: BaseReadOptions = {}) {
    return options.client ?? createBasePublicClient(options.network ?? 'mainnet')
}

function resolveBaseNetwork (options: BaseReadOptions = {}) {
    return options.network ?? 'mainnet'
}

async function withRetry<T>(fn: () => Promise<T>, retries: number = 3, delay: number = 500): Promise<T> {
    try {
        return await fn()
    } catch (err) {
        if (retries <= 1) {
            throw err
        }
        console.warn(`[PulseSDK] Operation failed, retrying in ${delay}ms... (${retries - 1} attempts left)`)
        await new Promise(resolve => setTimeout(resolve, delay))
        return withRetry(fn, retries - 1, delay * 2)
    }
}

export async function readBaseUserProfile (user: Address, options: BaseReadOptions = {}): Promise<BaseUserProfile> {
    const network = resolveBaseNetwork(options)
    const client = resolveBaseClient(options)
    const contract = getBaseContractByNetwork(network)

    try {
        const profile = await withRetry(() => client.readContract({
            address: contract.address,
            abi: PULSE_ABI,
            functionName: 'getUserProfile',
            args: [user],
        }))

        const profileData: any = profile
        return {
            totalPoints: profileData.totalPoints ?? profileData[0],
            currentStreak: profileData.currentStreak ?? profileData[1],
            longestStreak: profileData.longestStreak ?? profileData[2],
            lastCheckinTime: profileData.lastCheckinTime ?? profileData[3],
            totalCheckins: profileData.totalCheckins ?? profileData[4],
            level: profileData.level ?? profileData[5],
            stakedAmount: profileData.stakedAmount ?? profileData[6],
            joinedTime: profileData.joinedTime ?? profileData[7],
            exists: profileData.exists ?? profileData[8],
        }
    } catch (err) {
        console.error(`[PulseSDK] Failed to read user profile for ${user} after retries:`, err)
        return {
            totalPoints: 0n,
            currentStreak: 0n,
            longestStreak: 0n,
            lastCheckinTime: 0n,
            totalCheckins: 0n,
            level: 0n,
            stakedAmount: 0n,
            joinedTime: 0n,
            exists: false,
        }
    }
}


export async function readBaseGlobalStats (options: BaseReadOptions = {}): Promise<BaseGlobalStats> {
    const network = resolveBaseNetwork(options)
    const client = resolveBaseClient(options)
    const contract = getBaseContractByNetwork(network)

    try {
        const stats = await withRetry(() => client.readContract({
            address: contract.address,
            abi: PULSE_ABI,
            functionName: 'getGlobalStats',
        }))

        const statsData: any = stats
        return {
            totalUsers: statsData.totalUsers ?? statsData[0] ?? 0n,
            totalCheckins: statsData.totalCheckins ?? statsData[1] ?? 0n,
            totalPointsDistributed: statsData.totalPointsDistributed ?? statsData[2] ?? 0n,
        }
    } catch (err) {
        console.error('[PulseSDK] Failed to read global stats after retries:', err)
        return { totalUsers: 0n, totalCheckins: 0n, totalPointsDistributed: 0n }
    }
}

export async function readBaseQuestCompletion (
    user: Address,
    questId: PulseQuestId,
    options: BaseReadOptions = {},
): Promise<boolean> {
    const network = resolveBaseNetwork(options)
    const client = resolveBaseClient(options)
    const contract = getBaseContractByNetwork(network)

    try {
        const completed = await withRetry(() => client.readContract({
            address: contract.address,
            abi: PULSE_ABI,
            functionName: 'hasCompletedQuestToday',
            args: [user, questId],
        }))

        return completed as boolean
    } catch (error) {
        return false
    }
}

export async function readBaseCompletedQuests(user: Address, options: Readonly<BaseReadOptions> = {}): Promise<readonly PulseQuestId[]> {
    const network = resolveBaseNetwork(options)
    const client = resolveBaseClient(options)
    const contract = getBaseContractByNetwork(network)
    const questIds = Object.values(QUEST_IDS) as PulseQuestId[]

    try {
        const results = await withRetry(() => client.multicall({
            contracts: questIds.map(questId => ({
                address: contract.address as Address,
                abi: PULSE_ABI,
                functionName: 'hasCompletedQuestToday',
                args: [user, questId],
            })),
            allowFailure: true
        }))

        return questIds.filter((_, index) => {
            const res = results[index]
            return res?.status === 'success' && (res.result as any) === true
        })
    } catch (error) {
        // Fallback to sequential
        const completed: PulseQuestId[] = []
        for (const questId of questIds) {
            if (await readBaseQuestCompletion(user, questId, options)) {
                completed.push(questId)
            }
        }
        return completed
    }
}

export async function readBaseComboAvailability (user: Address, options: BaseReadOptions = {}): Promise<boolean> {
    const network = resolveBaseNetwork(options)
    const client = resolveBaseClient(options)
    const contract = getBaseContractByNetwork(network)

    try {
        const available = await withRetry(() => client.readContract({
            address: contract.address,
            abi: PULSE_ABI,
            functionName: 'isComboAvailable',
            args: [user],
        }))

        return available as boolean
    } catch (error) {
        return false
    }
}

