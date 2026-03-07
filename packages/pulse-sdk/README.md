# @winsznx/sdk

TypeScript SDK for integrating with the PULSE protocol on Base and Stacks.

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

## Included

- Contract addresses and ABI
- Quest IDs and point constants
- Base RPC read helpers
- Stacks read-only API helpers
- Network detection helpers
