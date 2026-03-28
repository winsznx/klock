import { COMBO_QUEST_IDS, QUEST_IDS, isStacksQuestCompleted, type BaseUserProfile, type PulseQuestId } from '@winsznx/sdk'
import type { PulseContractTarget, StacksUserProfile, UnifiedUserProfile } from './types.js'

export function createPulseAuthStorageKey(namespace = 'pulse') {
    return `${namespace}_logged_in_address`
}

export function truncateAddress(address: string, leading = 6, trailing = 4) {
    if (address.length <= leading + trailing) {
        return address
    }

    return `${address.slice(0, leading)}...${address.slice(-trailing)}`
}

export function resolveActivePulseContract(params: {
    stacksConnected: boolean
    appKitConnected: boolean
    baseNetwork: boolean
}): PulseContractTarget {
    if (params.stacksConnected) {
        return 'stacks'
    }

    if (params.appKitConnected && params.baseNetwork) {
        return 'base'
    }

    return 'none'
}

function toNumber(value: bigint | number | string | null | undefined, fallback = 0): number {
    if (value === null || value === undefined) {
        return fallback
    }

    if (typeof value === 'bigint') {
        return Number(value)
    }

    if (typeof value === 'number') {
        return Number.isNaN(value) ? fallback : value
    }

    if (typeof value === 'string') {
        if (value.trim() === '') return fallback
        const parsed = Number(value)
        return Number.isNaN(parsed) ? fallback : parsed
    }

    return fallback
}

export function normalizeBaseUserProfile(profile: BaseUserProfile): UnifiedUserProfile {
    return {
        totalPoints: toNumber(profile.totalPoints),
        currentStreak: toNumber(profile.currentStreak),
        longestStreak: toNumber(profile.longestStreak),
        level: toNumber(profile.level, 1),
        totalCheckins: toNumber(profile.totalCheckins),
        questBitmap: 0, // Base uses individual calls, needs building if bitmap is required
        exists: profile.exists,
    }
}

export function normalizeStacksUserProfile(profile: StacksUserProfile): UnifiedUserProfile {
    return {
        totalPoints: toNumber(profile.totalPoints),
        currentStreak: toNumber(profile.currentStreak),
        longestStreak: toNumber(profile.longestStreak),
        level: toNumber(profile.level, 1),
        totalCheckins: toNumber(profile.totalCheckins),
        questBitmap: profile.questBitmap ?? 0,
        exists: profile.exists,
    }
}

export function hasDailyCombo(checkQuest: (questId: PulseQuestId) => boolean) {
    return COMBO_QUEST_IDS.every((questId: PulseQuestId) => checkQuest(questId))
}

export function hasStacksDailyCombo(bitmap: number) {
    return COMBO_QUEST_IDS.every((questId: PulseQuestId) => isStacksQuestCompleted(bitmap, questId))
}
