# Install

These packages publish to GitHub Packages under the `@winsznx` scope.

If you are installing outside this repo, add a scope mapping first:

```bash
echo "@winsznx:registry=https://npm.pkg.github.com" >> ~/.npmrc
```

## SDK only

```bash
npm install @winsznx/sdk
```

Use this when you only need typed readers, constants, and network helpers.

## SDK + React

```bash
npm install @winsznx/sdk @winsznx/react
```

Recommended peer dependencies for React consumers:

```bash
npm install @reown/appkit @stacks/connect @stacks/transactions viem wagmi
```

## Local workspace

```bash
npm install
npm run build:packages
```
