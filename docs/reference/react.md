# React Reference

## Providers

- `PulseAuthProvider`
- `PulseStacksProvider`

Provider responsibilities:

- `PulseAuthProvider` tracks local auth state for the connected AppKit account
- `PulseStacksProvider` manages Stacks wallet connection, profile reads, and quest actions

## Hooks

- `usePulseAuth()`
- `useStacks()`
- `usePulseContract()`
- `useUnifiedContract()`
- `useStacksWallet()`
- `useStacksContractInfo(isMainnet?)`

Hook roles:

- `usePulseAuth()` exposes login state and local auth helpers
- `usePulseContract()` targets Base contract reads and writes
- `useUnifiedContract()` routes between Base and Stacks based on the active wallet session
- `useStacksWallet()` targets AppKit-backed Stacks sessions

Selection notes:

- `usePulseContract()` is Base-only
- `useUnifiedContract()` is the best default when the UI may run on either chain
- `useStacks()` is an alias of `usePulseStacks()`

## Components

- `PulseAccessGate`

Component note:

- `PulseAccessGate` expects the surrounding tree to already include `PulseAuthProvider` and `PulseStacksProvider`

## Utilities

- `createPulseAuthStorageKey(namespace?)`
- `truncateAddress(address, leading?, trailing?)`
- `resolveActivePulseContract({ stacksConnected, appKitConnected, baseNetwork })`
- `normalizeBaseUserProfile(profile)`
- `normalizeStacksUserProfile(profile)`
- `hasDailyCombo(checkQuest)`
- `hasStacksDailyCombo(bitmap)`

Utility notes:

- `createPulseAuthStorageKey()` helps isolate auth state when multiple demos or apps share one browser
- `truncateAddress()` is a display helper only and should not be used for identity comparisons
