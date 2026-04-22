import { ClarityType, cvToHex, hexToCV, principalCV, uintCV } from '@stacks/transactions'
import { QUEST_IDS, STACKS_CONTRACTS } from './constants.js'
import type {
    PulseQuestId,
    PulseStacksNetwork,
    StacksContractConfig,
    StacksDailyQuestStatus,
    StacksReadOnlyResponse,
    StacksUserProfile,
} from './types.js'

export interface StacksReadOptions {
    network?: PulseStacksNetwork
    sender?: string
}

type ClarityTupleField = {
    value?: bigint | boolean | string
}

type ClarityOptionalTuple = {
    type?: ClarityType | string
    value?: {
        value?: Record<string, ClarityTupleField>
        data?: Record<string, ClarityTupleField>
    }
}

export function isStacksAddress(address: string | null | undefined): address is string {
    return typeof address === 'string' && (address.startsWith('SP') || address.startsWith('ST'))
}

export function isStacksMainnetAddress(address: string | null | undefined): boolean {
    return address?.startsWith('SP') ?? false
}

export function getStacksContract(network: PulseStacksNetwork = 'mainnet'): StacksContractConfig {
    return STACKS_CONTRACTS[network]
}

export function getStacksContractByAddress(address: string | null | undefined): StacksContractConfig {
    if (!address) {
        throw new Error('getStacksContractByAddress: address is required')
    }

    return getStacksContract(isStacksMainnetAddress(address) ? 'mainnet' : 'testnet')
}

export function isStacksQuestCompleted(bitmap: number, questId: PulseQuestId): boolean {
    return (bitmap & (1 << questId)) !== 0
}

export function getStacksCompletedQuests(bitmap: number): PulseQuestId[] {
    return (Object.values(QUEST_IDS) as PulseQuestId[]).filter((questId) => isStacksQuestCompleted(bitmap, questId))
}

function resolveStacksOptions(options: StacksReadOptions = {}) {
    const network = options.network ?? 'mainnet'
    const contract = getStacksContract(network)
    return {
        network,
        contract,
        sender: options.sender ?? contract.contractAddress,
    }
}

async function callStacksReadOnly(
    functionName: string,
    args: Array<string>,
    options: StacksReadOptions = {},
): Promise<StacksReadOnlyResponse | null> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    try {
        const { contract, sender } = resolveStacksOptions(options)
        const response = await fetch(
            `${contract.apiUrl}/v2/contracts/call-read/${contract.contractAddress}/${contract.contractName}/${functionName}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                signal: controller.signal,
                body: JSON.stringify({
                    sender,
                    arguments: args,
                }),
            },
        )

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'No detail available')
            console.error(`[StacksSDK] HTTP error ${response.status} for ${functionName}: ${errorText}`)
            return null
        }

        const data = await response.json()
        return data as StacksReadOnlyResponse
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            console.error(`[StacksSDK] read-only call timed out after 10s: ${functionName}`)
        } else {
            console.error(`[StacksSDK] read-only call failed: ${functionName}`, error)
        }
        return null
    } finally {
        clearTimeout(timeout)
    }
}


function parseClarityUInt(result: string): number {
    const clarityValue = hexToCV(result) as { value?: bigint }
    return Number(clarityValue.value ?? BigInt(0))
}

function parseClarityOptionalTuple(result: string): Record<string, ClarityTupleField> | null {
    const clarityValue = hexToCV(result) as ClarityOptionalTuple
    if (
        clarityValue.type !== 'some' &&
        clarityValue.type !== ClarityType.OptionalSome
    ) {
        return null
    }

    return clarityValue.value?.value ?? clarityValue.value?.data ?? null
}

function parseTupleUInt(data: Record<string, ClarityTupleField> | null, key: string, fallback = 0): number {
    if (!data) {
        return fallback
    }

    const value = data[key]?.value
    if (typeof value === 'bigint') {
        return Number(value)
    }

    if (typeof value === 'number') {
        return value
    }

    return fallback
}

function parseTupleBoolean(data: Record<string, ClarityTupleField> | null, key: string, fallback = false): boolean {
    if (!data) return fallback

    const field = data[key] as (ClarityTupleField & { type?: string | number }) | undefined
    if (!field) return fallback

    // Handle v7 Clarity values which often wrap the 'value' or have a distinct 'type'
    if (typeof field.value === 'boolean') return field.value
    
    // ClarityType.BoolTrue is 3, BoolFalse is 4
    if (field.type === 3 || field.type === 'true' || (field as any).type === ClarityType.BoolTrue) return true
    if (field.type === 4 || field.type === 'false' || (field as any).type === ClarityType.BoolFalse) return false

    return fallback
}


function parseClarityListUInt(result: string): bigint[] {
    try {
        const clarityValue = hexToCV(result) as { list?: Array<{ value?: bigint }> }
        return clarityValue.list?.map(v => v.value ?? 0n) ?? []
    } catch {
        return []
    }
}

export async function readStacksGlobalStats(options: StacksReadOptions = {}): Promise<{
    totalUsers: bigint
    totalCheckins: bigint
    totalPointsDistributed: bigint
}> {
    const data = await callStacksReadOnly('get-global-stats', [], options)
    if (!data?.okay || !data.result) {
        return { totalUsers: 0n, totalCheckins: 0n, totalPointsDistributed: 0n }
    }

    const stats = parseClarityListUInt(data.result)
    return {
        totalUsers: stats[0] ?? 0n,
        totalCheckins: stats[1] ?? 0n,
        totalPointsDistributed: stats[2] ?? 0n,
    }
}

export async function readStacksCurrentDay(options: StacksReadOptions = {}): Promise<number> {
    try {
        const data = await callStacksReadOnly('get-day', [], options)
        if (!data?.okay || !data.result) {
            return 0
        }
        return parseClarityUInt(data.result)
    } catch (err) {
        console.error('[StacksSDK] Failed to read current day:', err)
        return 0
    }
}


export async function readStacksDailyQuestStatus(
    user: string,
    day: number,
    options: StacksReadOptions = {},
): Promise<StacksDailyQuestStatus | null> {
    const data = await callStacksReadOnly(
        'get-daily-quest-status',
        [cvToHex(principalCV(user)), cvToHex(uintCV(day))],
        options,
    )

    if (!data?.okay || !data.result || data.result === '0x09') {
        return null
    }

    const tuple = parseClarityOptionalTuple(data.result)
    if (!tuple) {
        return null
    }

    return {
        completedQuests: parseTupleUInt(tuple, 'completed-quests'),
        firstQuestBlock: parseTupleUInt(tuple, 'first-quest-block'),
        comboActivated: parseTupleBoolean(tuple, 'combo-activated'),
        exists: true,
    }
}

export async function readStacksUserProfile(
    user: string,
    options: StacksReadOptions = {},
): Promise<StacksUserProfile | null> {
    const [profileData, day] = await Promise.all([
        callStacksReadOnly('get-user-profile', [cvToHex(principalCV(user))], options),
        readStacksCurrentDay(options)
    ])

    if (!profileData?.okay || !profileData.result || profileData.result === '0x09') {
        return null
    }

    const tuple = parseClarityOptionalTuple(profileData.result)
    if (!tuple) {
        return null
    }

    // Fetch daily status to get quest bitmap for the current day
    let questBitmap = 0
    if (day > 0) {
        const dailyStatus = await readStacksDailyQuestStatus(user, day, options)
        if (dailyStatus) {
            questBitmap = dailyStatus.completedQuests
        }
    }

    return {
        totalPoints: parseTupleUInt(tuple, 'total-points'),
        currentStreak: parseTupleUInt(tuple, 'current-streak'),
        longestStreak: parseTupleUInt(tuple, 'longest-streak'),
        lastCheckinBlock: parseTupleUInt(tuple, 'last-checkin-block'),
        totalCheckins: parseTupleUInt(tuple, 'total-checkins'),
        level: parseTupleUInt(tuple, 'level', 1),
        questBitmap,
        exists: true,
    }
}

export async function readStacksCompletedQuests(
    user: string,
    options: StacksReadOptions = {},
): Promise<PulseQuestId[]> {
    const day = await readStacksCurrentDay(options)
    if (day === 0) {
        return []
    }

    const status = await readStacksDailyQuestStatus(user, day, options)
    if (!status) {
        return []
    }

    return getStacksCompletedQuests(status.completedQuests)
}
