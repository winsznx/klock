# React Reference

## Providers

- `PulseAuthProvider`
- `PulseStacksProvider`

## Hooks

- `usePulseAuth()`
- `useStacks()`
- `usePulseContract()`
- `useUnifiedContract()`
- `useStacksWallet()`
- `useStacksContractInfo(isMainnet?)`

## Components

- `PulseAccessGate`

## Utilities

- `createPulseAuthStorageKey(namespace?)`
- `truncateAddress(address, leading?, trailing?)`
- `resolveActivePulseContract({ stacksConnected, appKitConnected, baseNetwork })`
- `normalizeBaseUserProfile(profile)`
- `normalizeStacksUserProfile(profile)`
- `hasDailyCombo(checkQuest)`
- `hasStacksDailyCombo(bitmap)`
