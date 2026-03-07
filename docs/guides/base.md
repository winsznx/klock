# Base Guide

Use the SDK when you only need read access to the Base contracts.

```ts
import {
  createBasePublicClient,
  readBaseCompletedQuests,
  readBaseGlobalStats,
  readBaseUserProfile,
} from '@pulseprotocol/sdk'

const client = createBasePublicClient('mainnet')

const [profile, stats, quests] = await Promise.all([
  readBaseUserProfile('0xYourAddress', { client, network: 'mainnet' }),
  readBaseGlobalStats({ client, network: 'mainnet' }),
  readBaseCompletedQuests('0xYourAddress', { client, network: 'mainnet' }),
])
```

## Supported networks

- `mainnet`
- `testnet`

## Recommended pattern

- Use the SDK in server code for reads.
- Use `@pulseprotocol/react` in client code for writes and wallet-aware UI.
