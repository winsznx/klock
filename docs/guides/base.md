# Base Guide

Use the SDK when you only need read access to the Base contracts.

```ts
import {
  createBasePublicClient,
  readBaseCompletedQuests,
  readBaseGlobalStats,
  readBaseUserProfile,
} from '@winsznx/sdk'

const client = createBasePublicClient('mainnet')

const [profile, stats, quests] = await Promise.all([
  readBaseUserProfile('0xYourAddress', { client, network: 'mainnet' }),
  readBaseGlobalStats({ client, network: 'mainnet' }),
  readBaseCompletedQuests('0xYourAddress', { client, network: 'mainnet' }),
])
```

Reuse one `PublicClient` across related reads when you are making multiple calls to the same Base network.
`readBaseCompletedQuests()` checks each quest id under the hood, so it is best suited to grouped dashboard reads rather than hot-path polling.

## Supported networks

- `mainnet`
- `testnet`

Use `testnet` when you are pointed at Base Sepolia and `mainnet` for the production Base deployment.

## Recommended pattern

- Use the SDK in server code for reads.
- Use `@winsznx/react` in client code for writes and wallet-aware UI.
- Prefer calling the Base read helpers from route handlers, server actions, or other server-only modules.
