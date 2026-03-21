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

Use `useUnifiedContract()` when the same surface needs to support either Base or Stacks sessions without separate UI branches.

## Notes

- Mainnet addresses start with `SP`.
- Testnet addresses start with `ST`.
- The React helpers treat Stacks as the preferred active contract when both Base and Stacks sessions are present.
