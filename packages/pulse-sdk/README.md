# @pulseprotocol/sdk

TypeScript SDK for integrating with the PULSE protocol on Base and Stacks.

## Install

```bash
npm install @pulseprotocol/sdk
```

## Usage

```ts
import { readBaseUserProfile, readStacksUserProfile } from '@pulseprotocol/sdk'

const baseProfile = await readBaseUserProfile('0xYourAddress', {
  network: 'mainnet',
})

const stacksProfile = await readStacksUserProfile('SPYourAddress', {
  network: 'mainnet',
})
```

## Included

- Contract addresses and ABI
- Quest IDs and point constants
- Base RPC read helpers
- Stacks read-only API helpers
- Network detection helpers
