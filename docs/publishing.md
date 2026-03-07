# Publishing

## Preflight

```bash
npm run release:check
node scripts/release-packages.mjs --dry-run
```

## CI publish

The repository includes `.github/workflows/publish-packages.yml` for manual or release-triggered publication to GitHub Packages with `GITHUB_TOKEN`.

The workflow expects:

- package names under the `@winsznx` scope
- `publishConfig.registry` set to `https://npm.pkg.github.com`
- `repository` set to `https://github.com/winsznx/klock.git`

## Local publish

Create or reuse an `.npmrc` entry for the scope:

```bash
echo "@winsznx:registry=https://npm.pkg.github.com" >> ~/.npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_CLASSIC_PAT" >> ~/.npmrc
```

Use a classic personal access token with package write access.

```bash
node scripts/release-packages.mjs
```

Packages are published in this order:

1. `@winsznx/sdk`
2. `@winsznx/react`
