# @winsznx/react

React hooks and providers for PULSE apps built with AppKit, wagmi, and Stacks wallets.

The package is published to npmjs and GitHub Packages under the `@winsznx` scope.

## Install

```bash
npm install @winsznx/sdk @winsznx/react
```

Create your provider wrapper in a client component so the wallet and auth hooks can read browser session state.

For AppKit and wallet-aware flows, install the matching peer dependencies in the consuming app:

```bash
npm install @reown/appkit @stacks/connect @stacks/transactions viem wagmi
```

These packages stay as peers so the consuming app keeps control of its wallet adapter versions.

## Included

- `PulseAuthProvider` and `usePulseAuth`
- `PulseStacksProvider` and `usePulseStacks`
- `usePulseContract` for Base contract reads and writes
- `useUnifiedContract` for Base or Stacks routing
- `useStacksWallet` for AppKit-based Stacks sessions
- `PulseAccessGate` for simple auth-aware UI gating

`useStacks()` is available as a short alias of `usePulseStacks()`.
`useStacksWallet()` is useful when you need an AppKit-specific `isStacksConnected` guard for Stacks-only actions.
`PulseAuthProvider` can also scope its browser login state with `namespace` or `storageKey` when multiple apps share one origin.

For mixed-chain UI, start with `useUnifiedContract()` and only drop to the chain-specific hooks when you need network-specific behavior.
