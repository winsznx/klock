# Next.js SDK Demo

This example shows how to wire `@winsznx/sdk` and `@winsznx/react` into a standalone Next.js app.

## Install

```bash
npm install
cd examples/next-sdk-demo
npm install
```

For a standalone consumer app, install the published packages directly:

```bash
npm install @winsznx/sdk@^0.1.1 @winsznx/react@^0.1.1
```

## Environment

Set `NEXT_PUBLIC_PROJECT_ID` before running the demo.

## Run

```bash
npm run dev
```

The example includes:

- AppKit and wagmi wiring
- `PulseAuthProvider` and `PulseStacksProvider`
- a read-only server-side SDK call
- a client-side `useUnifiedContract()` integration
