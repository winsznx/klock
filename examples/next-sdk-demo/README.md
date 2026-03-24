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

The example itself tracks those packages as normal dependencies, so `npm install` inside this directory is enough to keep the demo aligned.

## Environment

Set `NEXT_PUBLIC_PROJECT_ID` before running the demo.

## Run

```bash
npm run dev
```

Run the command from the `examples/next-sdk-demo` directory after setting the project id.

The example includes:

- AppKit and wagmi wiring
- `PulseAuthProvider` and `PulseStacksProvider`
- a read-only server-side SDK call
- a client-side `useUnifiedContract()` integration

The home page reads Base mainnet stats on the server before rendering the dashboard.
Provider setup lives in `components/providers.tsx`.
That provider wrapper also owns the shared `QueryClientProvider` and `WagmiProvider` setup for the demo.
The daily check-in button stays disabled until a supported wallet session is connected.
AppKit in this demo is configured for both Base and Base Sepolia.
