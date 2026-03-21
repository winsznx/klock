# React Guide

`@winsznx/react` packages the reusable app-facing integration layer.

## Providers

- `PulseAuthProvider`: local login state keyed to the active AppKit address.
- `PulseStacksProvider`: Stacks wallet connection, profile reads, and transaction helpers.

`PulseAuthProvider` also accepts an optional `namespace` or explicit `storageKey` when multiple apps need separate local auth state in the same browser.

## Hooks

- `usePulseContract()`: Base contract reads and writes.
- `useUnifiedContract()`: routes to Base or Stacks based on the current session.
- `useStacksWallet()`: AppKit-based Stacks hook for WalletConnect flows.

## Minimal setup

```tsx
'use client'

import { PulseAuthProvider, PulseStacksProvider } from '@winsznx/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PulseStacksProvider>
      <PulseAuthProvider>{children}</PulseAuthProvider>
    </PulseStacksProvider>
  )
}
```

Place the providers near the top of your app tree so wallet state and auth state stay available to every route that uses protocol hooks.

## Access gating

Use `PulseAccessGate` when you only need a simple “connected or logged in” boundary.
It fits best around dashboard panels, action bars, and other UI that should stay hidden until a wallet session is active.
