import { readBaseGlobalStats } from '@pulseprotocol/sdk'

const network = process.argv[2] === 'testnet' ? 'testnet' : 'mainnet'
const stats = await readBaseGlobalStats({ network })

console.log(`Base ${network} stats`)
console.log({
  totalUsers: stats.totalUsers.toString(),
  totalCheckins: stats.totalCheckins.toString(),
  totalPointsDistributed: stats.totalPointsDistributed.toString(),
})
