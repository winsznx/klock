# @winsznx/sdk

TypeScript SDK for integrating with the PULSE protocol on Base and Stacks.

The package is published to npmjs and GitHub Packages under the `@winsznx` scope.

## Install

```bash
npm install @winsznx/sdk
```

## Usage

```ts
import {
  createBasePublicClient,
  readBaseUserProfile,
  readStacksUserProfile,
} from '@winsznx/sdk'

const baseClient = createBasePublicClient('mainnet')

const baseProfile = await readBaseUserProfile('0xYourAddress', {
  client: baseClient,
  network: 'mainnet',
})

const stacksProfile = await readStacksUserProfile('SPYourAddress', {
  network: 'mainnet',
  sender: 'SPYourAddress',
})
```

`createBasePublicClient()` defaults to `mainnet`, so pass `testnet` explicitly when targeting Base Sepolia.
`readBaseGlobalStats()` is a good first smoke test because it does not require a user address.

Pass a custom Base client only when you need custom transport or chain configuration. Otherwise, the helpers can create the correct client from `network`.
Base read helpers return bigint-heavy contract data, so convert those fields before direct JSON serialization in scripts or APIs.
For Stacks reads, pass `sender` when the contract behavior depends on caller context. If omitted, the SDK falls back to the contract address for the selected network.

## Included

- Contract addresses and ABI
- Quest IDs and point constants
- Base RPC read helpers
- Stacks read-only API helpers
- Network detection helpers

Use `@winsznx/sdk` directly for server-side reads, scripts, and other non-React consumers.
