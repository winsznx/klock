# @winsznx/react

React hooks and providers for PULSE apps built with AppKit, wagmi, and Stacks wallets.

The package is published to npmjs and GitHub Packages under the `@winsznx` scope.

## Install

```bash
npm install @winsznx/sdk @winsznx/react
```

For AppKit and wallet-aware flows, install the matching peer dependencies in the consuming app:

```bash
npm install @reown/appkit @stacks/connect @stacks/transactions viem wagmi
```

## Included

- `PulseAuthProvider` and `usePulseAuth`
- `PulseStacksProvider` and `usePulseStacks`
- `usePulseContract` for Base contract reads and writes
- `useUnifiedContract` for Base or Stacks routing
- `useStacksWallet` for AppKit-based Stacks sessions
- `PulseAccessGate` for simple auth-aware UI gating
