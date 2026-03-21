import { readBaseGlobalStats } from '@winsznx/sdk'

const network = process.argv[2] === 'testnet' ? 'testnet' : 'mainnet'

if (process.argv[2] === '--help') {
  console.log('Usage: node read-global-stats.mjs [mainnet|testnet]')
  console.log('Defaults to mainnet when no network is provided')
  process.exit(0)
}

const stats = await readBaseGlobalStats({ network })

console.log(`Base ${network} stats`)
console.log(JSON.stringify({
  totalUsers: stats.totalUsers.toString(),
  totalCheckins: stats.totalCheckins.toString(),
  totalPointsDistributed: stats.totalPointsDistributed.toString(),
}, null, 2))
