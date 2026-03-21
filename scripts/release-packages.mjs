#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import path from 'node:path'

const dryRun = process.argv.includes('--dry-run')
const registryArg = process.argv.find((arg) => arg.startsWith('--registry='))?.split('=')[1]
const registryKey = registryArg ?? process.env.PUBLISH_REGISTRY ?? 'github'
const npmExecPath = process.env.npm_execpath
const npmCache = process.env.npm_config_cache ?? path.join(tmpdir(), 'klock-npm-cache')
const workspaces = [
  '@winsznx/sdk',
  '@winsznx/react',
]

const registries = {
  github: 'https://npm.pkg.github.com',
  npm: 'https://registry.npmjs.org',
}

const registry = registries[registryKey]
const scopeOverride = `--@winsznx:registry=${registry}`

if (!registry) {
  console.error(`Unsupported registry target: ${registryKey}`)
  process.exit(1)
}

for (const workspace of workspaces) {
  const args = ['publish', '--workspace', workspace, '--registry', registry, scopeOverride, '--cache', npmCache]

  if (registryKey === 'npm') {
    args.push('--access', 'public')
  }

  if (dryRun) {
    args.push('--dry-run')
  }

  const command = npmExecPath ? process.execPath : 'npm'
  const commandArgs = npmExecPath ? [npmExecPath, ...args] : args

  const result = spawnSync(command, commandArgs, {
    env: {
      ...process.env,
      npm_config_cache: npmCache,
    },
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}
