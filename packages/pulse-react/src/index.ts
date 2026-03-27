'use client'

export {
    PulseAuthProvider,
    AuthProvider,
    usePulseAuth,
    useAuth,
} from './auth.js'

export {
    PulseStacksProvider,
    StacksProvider,
    fetchStacksWalletProfile,
    usePulseStacks,
    useStacks,
    useStacksContractInfo,
    type PulseStacksContextValue,
} from './stacks.js'

export {
    useBasePulseContract,
    usePulseContract,
    type UseBasePulseContractResult,
} from './base.js'

export {
    useAppKitStacksWallet,
    useStacksWallet,
} from './appkit-stacks.js'

export {
    useUnifiedPulseContract,
    useUnifiedContract,
} from './unified.js'

export { PulseAccessGate } from './gate.js'

export {
    DAILY_COMBO_QUEST_IDS,
    createPulseAuthStorageKey,
    hasDailyCombo,
    hasStacksDailyCombo,
    normalizeBaseUserProfile,
    normalizeStacksUserProfile,
    resolveActivePulseContract,
    truncateAddress,
} from './utils.js'

export type {
    ContractInfo,
    GlobalStats,
    PulseActionResult,
    PulseAuthContextValue,
    PulseContractTarget,
    StacksContractInfo,
    StacksUserProfile,
    UnifiedContractInfo,
    UnifiedUserProfile,
    UserProfile,
} from './types.js'

