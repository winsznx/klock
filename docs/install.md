# Install

These packages publish to npmjs and GitHub Packages under the `@winsznx` scope.

The simplest path for external consumers is npmjs:

```bash
npm install @winsznx/sdk
```

npmjs installs do not require the `@winsznx` scope mapping in `~/.npmrc`.

Use GitHub Packages only if you specifically want installs from `npm.pkg.github.com`.
GitHub Packages installs still require GitHub-authenticated npm access on the machine that runs `npm install`.

If you are installing from GitHub Packages, add a scope mapping first:

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

Standalone example apps like `examples/next-sdk-demo` keep their own `package.json`, so install inside that directory separately when you want to run them.
