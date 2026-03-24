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

## Next example cannot resolve dependencies

- Run `npm install` inside `examples/next-sdk-demo`.
- The standalone example is not part of the root workspace package list.

## Package tests fail in CI because the test glob is not found

- Prefer explicit `node --test test/*.test.mjs` patterns for the package-level test scripts.
- Do not assume the CI shell will expand `**` globs the same way as your local shell.

## Stacks session is connected but writes fail

- Confirm the wallet exposes `stx_callContract`.
- If you are using AppKit, confirm the session includes a `stacks` or `bip122` namespace.
- Verify the contract identifier matches the address prefix (`SP` mainnet, `ST` testnet).

## Base reads fail on the server

- Check the target network (`mainnet` vs `testnet`).
- Confirm the user address is a valid `0x...` EVM address.
- Avoid passing your own `PublicClient` unless you need custom transport behavior.

## npmjs publish targets GitHub Packages instead

- Check `~/.npmrc` for an `@winsznx:registry=https://npm.pkg.github.com` mapping.
- Override the scope registry explicitly when publishing to npmjs if your user config still points the scope at GitHub Packages.

## GitHub Packages still shows the old repository source

- Confirm the latest package version was published from the intended repo, not from a local machine or the former monorepo.
