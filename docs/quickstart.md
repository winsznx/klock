# Quickstart

## Prerequisites

- Node.js 20+
- npm 10+ recommended
- `NEXT_PUBLIC_PROJECT_ID` for the reference app and the Next.js example

## Install

```bash
npm install
```

In this workspace, that install links the local `@winsznx/sdk` and `@winsznx/react` packages for development and CI.

## Install the published packages

For a consumer project outside this workspace:

```bash
npm install @winsznx/sdk @winsznx/react
```

## Build the packages

```bash
npm run build:packages
```

Consumer apps that install `@winsznx/sdk` or `@winsznx/react` from a registry do not need this workspace build step.

## Run the reference app

```bash
npm run dev
```

The app lives at `http://localhost:3000`.

## Validate the workspace

```bash
npm run test:packages
npm run type-check
```
