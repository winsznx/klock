# SDK Reference

## Constants

- `BASE_CONTRACTS`
- `STACKS_CONTRACTS`
- `CHAIN_IDS`
- `TESTNET_CHAIN_IDS`
- `MAINNET_CHAIN_IDS`
- `QUEST_IDS`
- `QUEST_POINTS`
- `PULSE_ABI`

## Base helpers

- `createBasePublicClient(network?)`
- `getBaseContract(chainId)`
- `getBaseContractByNetwork(network?)`
- `isBaseChain(chainId)`
- `isBaseTestnetChain(chainId)`
- `readBaseUserProfile(address, options?)`
- `readBaseGlobalStats(options?)`
- `readBaseQuestCompletion(address, questId, options?)`
- `readBaseCompletedQuests(address, options?)`
- `readBaseComboAvailability(address, options?)`

Base read helpers accept an optional `options` object with:

- `network`: `'mainnet' | 'testnet'`
- `client`: custom viem public client for the target Base network

Contract notes:

- `getBaseContract()` is useful when you already have the active Base chain id from wallet state
- `getBaseContractByNetwork()` is simpler in server code where the target network is already known

Return notes:

- `readBaseUserProfile()` returns the raw contract tuple, including the `exists` flag from the Base profile
- `readBaseQuestCompletion()` resolves to a boolean
- `readBaseCompletedQuests()` resolves to an array of quest ids
- `readBaseComboAvailability()` resolves to a boolean

## Stacks helpers

- `getStacksContract(network?)`
- `getStacksContractByAddress(address)`
- `isStacksAddress(address)`
- `isStacksMainnetAddress(address)`
- `isStacksQuestCompleted(bitmap, questId)`
- `getStacksCompletedQuests(bitmap)`
- `readStacksCurrentDay(options?)`
- `readStacksDailyQuestStatus(address, day, options?)`
- `readStacksUserProfile(address, options?)`
- `readStacksCompletedQuests(address, options?)`

Stacks read helpers accept an optional `options` object with:

- `network`: `'mainnet' | 'testnet'`
- `sender`: Stacks address used as the read-only call sender

Contract notes:

- `getStacksContract()` resolves from an explicit environment choice
- `getStacksContractByAddress()` infers mainnet or testnet from the address prefix
- `isStacksQuestCompleted()` checks a local quest bitmap and does not make a network request
- `getStacksCompletedQuests()` expands a local bitmap into quest ids without calling the network

Return notes:

- `readStacksCurrentDay()` resolves to the current contract day number, or `0` when the read fails
- `readStacksDailyQuestStatus()` resolves to the stored daily quest tuple or `null`
- `readStacksUserProfile()` resolves to the stored profile tuple or `null`
- `readStacksCompletedQuests()` resolves to an array of completed quest ids for the active day, or an empty array when no day or status is available
