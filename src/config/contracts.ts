import {
    BASE_CONTRACTS,
    CHAIN_IDS,
    MAINNET_CHAIN_IDS,
    PULSE_ABI,
    QUEST_IDS,
    QUEST_POINTS,
    STACKS_CONTRACTS,
    TESTNET_CHAIN_IDS,
    getBaseContract as getSdkBaseContract,
    getStacksContract as getSdkStacksContract,
    isBaseChain,
    isBaseTestnetChain,
} from '@pulseprotocol/sdk'

export {
    BASE_CONTRACTS,
    CHAIN_IDS,
    MAINNET_CHAIN_IDS,
    PULSE_ABI,
    QUEST_IDS,
    QUEST_POINTS,
    STACKS_CONTRACTS,
    TESTNET_CHAIN_IDS,
}

export function getBaseContract(chainId: number) {
    if (isBaseChain(chainId)) {
        return getSdkBaseContract(chainId)
    }

    return BASE_CONTRACTS.testnet
}

export function getStacksContract(isMainnet: boolean) {
    return getSdkStacksContract(isMainnet ? 'mainnet' : 'testnet')
}

export function isTestnet(chainId: number): boolean {
    return isBaseTestnetChain(chainId) || TESTNET_CHAIN_IDS.includes(chainId as (typeof TESTNET_CHAIN_IDS)[number])
}

export function isBaseNetwork(chainId: number): boolean {
    return isBaseChain(chainId)
}
