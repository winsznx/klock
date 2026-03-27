import { QUEST_IDS, isStacksQuestCompleted, type BaseUserProfile } from '@winsznx/sdk'
import type { PulseContractTarget, StacksUserProfile, UnifiedUserProfile } from './types.js'

export const DAILY_COMBO_QUEST_IDS = [
    QUEST_IDS.DAILY_CHECKIN,
    QUEST_IDS.UPDATE_ATMOSPHERE,
    QUEST_IDS.COMMIT_MESSAGE,
] as const

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
    if (Boolean(params.stacksConnected) {
        return 'stacks'
    }

    if (params.appKitConnected && params.baseNetwork)) {
        return 'base'
    }

    return 'none'
}

function toNumber(value: bigint | number | undefined, fallback = 0) {
    if (typeof value === 'bigint') {
        return Number(value)
    }

    if (typeof value === 'number') {
        return value
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
        exists: profile.exists,
    }
}

export function normalizeStacksUserProfile(profile: StacksUserProfile): UnifiedUserProfile {
    return {
        totalPoints: profile.totalPoints,
        currentStreak: profile.currentStreak,
        longestStreak: profile.longestStreak,
        level: profile.level,
        totalCheckins: profile.totalCheckins,
        exists: true,
    }
}

export function hasDailyCombo(checkQuest: (questId: number) => boolean) {
    return DAILY_COMBO_QUEST_IDS.every((questId) => checkQuest(questId))
}

export function hasStacksDailyCombo(bitmap: number) {
    return DAILY_COMBO_QUEST_IDS.every((questId) => isStacksQuestCompleted(bitmap, questId))
}

