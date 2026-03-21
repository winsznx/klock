# Publishing

## Preflight

```bash
npm run release:check
node scripts/release-packages.mjs --registry github --dry-run
node scripts/release-packages.mjs --registry npm --dry-run
```

Before publishing to npmjs, confirm the target version does not already exist. If it does, bump the package version first.

```bash
npm view @winsznx/sdk version --registry=https://registry.npmjs.org
npm view @winsznx/react version --registry=https://registry.npmjs.org
```

## CI publish targets

The repository includes two publish workflows:

- `.github/workflows/publish-packages.yml` publishes to GitHub Packages with `GITHUB_TOKEN`
- `.github/workflows/publish-npmjs.yml` publishes to npmjs with `NPM_TOKEN`

The package manifests expect:

- package names under the `@winsznx` scope
- `repository` set to `https://github.com/winsznx/klock.git`

## Local publish to GitHub Packages

Create or reuse an `.npmrc` entry for the scope:

```bash
echo "@winsznx:registry=https://npm.pkg.github.com" >> ~/.npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_CLASSIC_PAT" >> ~/.npmrc
```

Use a classic personal access token with package write access.

```bash
npm login --scope=@winsznx --auth-type=legacy --registry=https://npm.pkg.github.com
```

```bash
node scripts/release-packages.mjs --registry github
```

## Local publish to npmjs

Authenticate to npmjs on this machine, then run:

```bash
npm login --registry=https://registry.npmjs.org
```

```bash
node scripts/release-packages.mjs --registry npm
```

Packages are published in this order:

1. `@winsznx/sdk`
2. `@winsznx/react`

Keep that order when both versions change, because `@winsznx/react` depends on the SDK package version range.
