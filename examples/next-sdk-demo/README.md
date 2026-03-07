# Next.js SDK Demo

This example shows how to wire `@pulseprotocol/sdk` and `@pulseprotocol/react` into a standalone Next.js app.

## Install

```bash
npm install
cd examples/next-sdk-demo
npm install
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
