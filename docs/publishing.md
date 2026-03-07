# Publishing

## Preflight

```bash
npm run release:check
node scripts/release-packages.mjs --dry-run
```

## CI publish

The repository includes `.github/workflows/publish-packages.yml` for manual package publication with `NPM_TOKEN`.

## Local publish

```bash
node scripts/release-packages.mjs
```

Packages are published in this order:

1. `@pulseprotocol/sdk`
2. `@pulseprotocol/react`
