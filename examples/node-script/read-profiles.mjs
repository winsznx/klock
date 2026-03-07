import { readBaseUserProfile, readStacksUserProfile } from '@winsznx/sdk'

const [baseAddress, stacksAddress] = process.argv.slice(2)

if (!baseAddress || !stacksAddress) {
  console.error('Usage: node read-profiles.mjs <base-address> <stacks-address>')
  process.exit(1)
}

const [baseProfile, stacksProfile] = await Promise.all([
  readBaseUserProfile(baseAddress, { network: 'mainnet' }),
  readStacksUserProfile(stacksAddress, { network: 'mainnet', sender: stacksAddress }),
])

console.log('Base profile')
console.log(baseProfile)
console.log('')
console.log('Stacks profile')
console.log(stacksProfile)
