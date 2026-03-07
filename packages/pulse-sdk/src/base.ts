import { createPublicClient, http, type Address, type PublicClient } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { BASE_CONTRACTS, PULSE_ABI, QUEST_IDS } from './constants'
import type {
    BaseContractConfig,
    BaseGlobalStats,
    BaseUserProfile,
    PulseBaseNetwork,
    PulseQuestId,
    SupportedBaseChainId,
} from './types'

export interface BaseReadOptions {
    client?: PublicClient
    network?: PulseBaseNetwork
}

export function isBaseChain(chainId: number | undefined): chainId is SupportedBaseChainId {
    return chainId === BASE_CONTRACTS.mainnet.chainId || chainId === BASE_CONTRACTS.testnet.chainId
}

export function isBaseTestnetChain(chainId: number | undefined): boolean {
    return chainId === BASE_CONTRACTS.testnet.chainId
}

export function getBaseContract(chainId: number): BaseContractConfig {
    if (chainId === BASE_CONTRACTS.mainnet.chainId) {
        return BASE_CONTRACTS.mainnet
    }

    if (chainId === BASE_CONTRACTS.testnet.chainId) {
        return BASE_CONTRACTS.testnet
    }

    throw new Error(`Unsupported Base chain ID: ${chainId}`)
}

export function getBaseContractByNetwork(network: PulseBaseNetwork = 'mainnet') {
    return BASE_CONTRACTS[network]
}

export function createBasePublicClient(network: PulseBaseNetwork = 'mainnet') {
    return createPublicClient({
        chain: network === 'mainnet' ? base : baseSepolia,
        transport: http(BASE_CONTRACTS[network].rpcUrl),
    })
}

function resolveBaseClient(options: BaseReadOptions = {}) {
    return options.client ?? createBasePublicClient(options.network ?? 'mainnet')
}

function resolveBaseNetwork(options: BaseReadOptions = {}) {
    return options.network ?? 'mainnet'
}

export async function readBaseUserProfile(user: Address, options: BaseReadOptions = {}): Promise<BaseUserProfile> {
    const network = resolveBaseNetwork(options)
    const client = resolveBaseClient(options)
    const contract = getBaseContractByNetwork(network)

    const profile = await client.readContract({
        address: contract.address,
        abi: PULSE_ABI,
        functionName: 'getUserProfile',
        args: [user],
    })

    return profile as BaseUserProfile
}

export async function readBaseGlobalStats(options: BaseReadOptions = {}): Promise<BaseGlobalStats> {
    const network = resolveBaseNetwork(options)
    const client = resolveBaseClient(options)
    const contract = getBaseContractByNetwork(network)

    const stats = await client.readContract({
        address: contract.address,
        abi: PULSE_ABI,
        functionName: 'getGlobalStats',
    })

    const [totalUsers, totalCheckins, totalPointsDistributed] = stats as [bigint, bigint, bigint]
    return { totalUsers, totalCheckins, totalPointsDistributed }
}

export async function readBaseQuestCompletion(
    user: Address,
    questId: PulseQuestId,
    options: BaseReadOptions = {},
): Promise<boolean> {
    const network = resolveBaseNetwork(options)
    const client = resolveBaseClient(options)
    const contract = getBaseContractByNetwork(network)

    const completed = await client.readContract({
        address: contract.address,
        abi: PULSE_ABI,
        functionName: 'hasCompletedQuestToday',
        args: [user, questId],
    })

    return completed as boolean
}

export async function readBaseCompletedQuests(user: Address, options: BaseReadOptions = {}): Promise<PulseQuestId[]> {
    const questIds = Object.values(QUEST_IDS) as PulseQuestId[]
    const completed = await Promise.all(
        questIds.map(async (questId) => ({
            questId,
            completed: await readBaseQuestCompletion(user, questId, options),
        })),
    )

    return completed.filter((entry) => entry.completed).map((entry) => entry.questId)
}

export async function readBaseComboAvailability(user: Address, options: BaseReadOptions = {}): Promise<boolean> {
    const network = resolveBaseNetwork(options)
    const client = resolveBaseClient(options)
    const contract = getBaseContractByNetwork(network)

    const available = await client.readContract({
        address: contract.address,
        abi: PULSE_ABI,
        functionName: 'isComboAvailable',
        args: [user],
    })

    return available as boolean
}
