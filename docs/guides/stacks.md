# Stacks Guide

The SDK exposes read-only Stacks helpers, and the React package adds wallet-aware provider and hook support.

## Read-only access

```ts
import {
  readStacksCurrentDay,
  readStacksDailyQuestStatus,
  readStacksUserProfile,
} from '@pulseprotocol/sdk'

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

## Notes

- Mainnet addresses start with `SP`.
- Testnet addresses start with `ST`.
- The React helpers treat Stacks as the preferred active contract when both Base and Stacks sessions are present.
