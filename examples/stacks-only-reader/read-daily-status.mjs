import {
  readStacksCompletedQuests,
  readStacksCurrentDay,
  readStacksDailyQuestStatus,
} from '@winsznx/sdk'

const [address] = process.argv.slice(2)

if (address === '--help' || address === '-h') {
  console.log('Usage: node read-daily-status.mjs <stacks-address>')
  console.log('Network is inferred from the address prefix (SP=mainnet, ST=testnet)')
  console.log('The same address is used as the read-only sender for the Stacks helper calls')
  process.exit(0)
}

if (!address) {
  console.error('Usage: node read-daily-status.mjs <stacks-address>')
  process.exit(1)
}

const network = address.startsWith('SP') ? 'mainnet' : 'testnet'
const currentDay = await readStacksCurrentDay({ network, sender: address })
const status = await readStacksDailyQuestStatus(address, currentDay, { network, sender: address })
const quests = await readStacksCompletedQuests(address, { network, sender: address })

console.log(`Stacks daily status (${network})`)
console.log(JSON.stringify({ network, currentDay, status, quests }, null, 2))
