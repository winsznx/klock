import { readBaseUserProfile, readStacksUserProfile } from '@winsznx/sdk'

const [baseAddress, stacksAddress, baseNetworkArg, stacksNetworkArg] = process.argv.slice(2)
const baseNetwork = baseNetworkArg === 'testnet' ? 'testnet' : 'mainnet'
const stacksNetwork = stacksNetworkArg === 'testnet' ? 'testnet' : 'mainnet'

if (!baseAddress || !stacksAddress) {
  console.error('Usage: node read-profiles.mjs <base-address> <stacks-address> [base-network] [stacks-network]')
  process.exit(1)
}

const [baseProfile, stacksProfile] = await Promise.all([
  readBaseUserProfile(baseAddress, { network: baseNetwork }),
  readStacksUserProfile(stacksAddress, { network: stacksNetwork, sender: stacksAddress }),
])

console.log(`Base profile (${baseNetwork})`)
console.log(baseProfile)
console.log('')
console.log(`Stacks profile (${stacksNetwork})`)
console.log(stacksProfile)
