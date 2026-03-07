# Contributing

## Development flow

1. Install dependencies with `npm install`.
2. Build the packages with `npm run build:packages`.
3. Run `npm run test:packages` and `npm run type-check` before opening a PR.

## Scope

- Put protocol constants and read helpers in `packages/pulse-sdk`.
- Put reusable React hooks and providers in `packages/pulse-react`.
- Keep app-specific presentation code in `src`.
- Add consumer-facing examples under `examples`.
- Add supporting documentation under `docs`.

## Pull requests

- Prefer small, atomic changes.
- Update docs when public behavior changes.
- Add or extend tests for regressions in SDK parsing or React utility behavior.
