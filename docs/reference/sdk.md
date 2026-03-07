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
