import {
  readStacksCompletedQuests,
  readStacksCurrentDay,
  readStacksDailyQuestStatus,
} from '@winsznx/sdk'

const [address] = process.argv.slice(2)

if (!address) {
  console.error('Usage: node read-daily-status.mjs <stacks-address>')
  process.exit(1)
}

const network = address.startsWith('SP') ? 'mainnet' : 'testnet'
const currentDay = await readStacksCurrentDay({ network, sender: address })
const status = await readStacksDailyQuestStatus(address, currentDay, { network, sender: address })
const quests = await readStacksCompletedQuests(address, { network, sender: address })

console.log(JSON.stringify({ network, currentDay, status, quests }, null, 2))
