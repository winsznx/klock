# Troubleshooting

## `npm --workspace` fails inside scripts

The workspace scripts in this repo call the active npm CLI through `$npm_execpath` to avoid accidentally resolving an old `npm` binary from `node_modules/.bin`.

## React package build fails because the SDK is missing

Run:

```bash
npm run build:sdk
npm run build:react
```

`@winsznx/react` compiles against the built SDK declarations.

## Stacks session is connected but writes fail

- Confirm the wallet exposes `stx_callContract`.
- If you are using AppKit, confirm the session includes a `stacks` or `bip122` namespace.
- Verify the contract identifier matches the address prefix (`SP` mainnet, `ST` testnet).

## Base reads fail on the server

- Check the target network (`mainnet` vs `testnet`).
- Confirm the user address is a valid `0x...` EVM address.
- Avoid passing your own `PublicClient` unless you need custom transport behavior.
