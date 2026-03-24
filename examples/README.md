# Examples

- `next-sdk-demo`: reference Next.js integration using the SDK and React package.
- `node-script`: combined Node reader for Base and Stacks.
- `base-only-reader`: focused Base read example.
- `stacks-only-reader`: focused Stacks read example.

Use the Node-based examples when you want to validate package reads without setting up a browser app.
They can be run after the root workspace install without any extra browser or wallet setup.
The Base-only reader is the lightest smoke test because it only needs an optional network argument.
The combined node profile reader can infer Stacks testnet from an `ST...` address when no network argument is provided.
The Stacks-only reader also infers mainnet or testnet directly from the address prefix.
The Next.js demo additionally requires `NEXT_PUBLIC_PROJECT_ID`.
