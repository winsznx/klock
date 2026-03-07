#!/usr/bin/env node

import { spawnSync } from 'node:child_process'

const dryRun = process.argv.includes('--dry-run')
const workspaces = [
  '@winsznx/sdk',
  '@winsznx/react',
]

for (const workspace of workspaces) {
  const args = ['publish', '--workspace', workspace]
  if (dryRun) {
    args.push('--dry-run')
  }

  const result = spawnSync('npm', args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}
