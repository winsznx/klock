# PULSE Monorepo

PULSE is a multi-chain social ritual product spanning a reference Next.js app, a TypeScript SDK, and a React integration package for Base and Stacks.

Published packages use the GitHub Packages scope `@winsznx`.

## Workspace

- `packages/pulse-sdk`: typed contract constants, Base readers, and Stacks read-only helpers.
- `packages/pulse-react`: React hooks and providers for AppKit, wagmi, and Stacks wallet flows.
- `src`: the reference web app that now consumes the packages instead of duplicating protocol logic.
- `examples`: copyable consumer examples for Node, Next.js, Base-only, and Stacks-only integrations.
- `docs`: quickstart, guides, API reference, publishing, migration, and troubleshooting.

## Packages

### `@winsznx/sdk`

```bash
npm install @winsznx/sdk
```

```ts
import { readBaseUserProfile, readStacksUserProfile } from '@winsznx/sdk'

const baseProfile = await readBaseUserProfile('0xYourAddress', {
  network: 'mainnet',
})

const stacksProfile = await readStacksUserProfile('SPYourAddress', {
  network: 'mainnet',
  sender: 'SPYourAddress',
})
```

### `@winsznx/react`

```bash
npm install @winsznx/sdk @winsznx/react
```

```tsx
'use client'

import { PulseAuthProvider, PulseStacksProvider, useUnifiedContract } from '@winsznx/react'

function PulseDashboard() {
  const { userProfile, dailyCheckin } = useUnifiedContract()

  return (
    <div>
      <button onClick={() => void dailyCheckin()}>Daily check-in</button>
      <pre>{JSON.stringify(userProfile, null, 2)}</pre>
    </div>
  )
}

export function App() {
  return (
    <PulseStacksProvider>
      <PulseAuthProvider>
        <PulseDashboard />
      </PulseAuthProvider>
    </PulseStacksProvider>
  )
}
```

## Getting Started

```bash
npm install
npm run build:packages
npm run dev
```

Useful commands:

- `npm run build:packages`
- `npm run test:packages`
- `npm run type-check`
- `node scripts/release-packages.mjs --dry-run`

## Documentation

- [Quickstart](docs/quickstart.md)
- [Install](docs/install.md)
- [Base Guide](docs/guides/base.md)
- [Stacks Guide](docs/guides/stacks.md)
- [React Guide](docs/guides/react.md)
- [SDK Reference](docs/reference/sdk.md)
- [React Reference](docs/reference/react.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Publishing](docs/publishing.md)
- [Migration](docs/migration.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)

## Examples

- [Next.js integration](examples/next-sdk-demo/README.md)
- [Node script](examples/node-script/read-profiles.mjs)
- [Base-only reader](examples/base-only-reader/read-global-stats.mjs)
- [Stacks-only reader](examples/stacks-only-reader/read-daily-status.mjs)

## Contracts

### Base

- Mainnet: `0xcF0A164b64b92Fa6262e312cDB60a12c302e8F1c`
- Sepolia: `0x22E7AA46aDDF743c99322212852dB2FA17b404b2`

### Stacks

- Mainnet: `SP31DP8F8CF2GXSZBHHHK5J6Y061744E1TNFGYWYV.pulse`
- Testnet: `ST31DP8F8CF2GXSZBHHHK5J6Y061744E1TP7FRGHT.pulse`
