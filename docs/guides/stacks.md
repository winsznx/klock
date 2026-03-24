# Stacks Guide

The SDK exposes read-only Stacks helpers, and the React package adds wallet-aware provider and hook support.

## Read-only access

```ts
import {
  readStacksCurrentDay,
  readStacksDailyQuestStatus,
  readStacksUserProfile,
} from '@winsznx/sdk'

const currentDay = await readStacksCurrentDay({
  network: 'mainnet',
  sender: 'SPYourAddress',
})

const status = await readStacksDailyQuestStatus('SPYourAddress', currentDay, {
  network: 'mainnet',
  sender: 'SPYourAddress',
})

const profile = await readStacksUserProfile('SPYourAddress', {
  network: 'mainnet',
  sender: 'SPYourAddress',
})
```

## Wallet-driven flows

Wrap your UI with `PulseStacksProvider`, then call `useStacks()` or `useUnifiedContract()`.
`useStacks()` is the short alias for `usePulseStacks()`.

Use `useUnifiedContract()` when the same surface needs to support either Base or Stacks sessions without separate UI branches.

## Notes

- `getStacksContractByAddress()` is useful when you only have the connected Stacks address and want the matching contract config.
- Mainnet addresses start with `SP`.
- Testnet addresses start with `ST`.
- Pass `sender` in SDK read calls so the read-only request executes with the expected Stacks caller context.
- If `readStacksCurrentDay()` returns `0`, skip the dependent daily status reads and treat the day lookup as unavailable.
- `readStacksCompletedQuests()` can return an empty array when the current day is unavailable or no daily status has been stored yet.
- The React helpers treat Stacks as the preferred active contract when both Base and Stacks sessions are present.
