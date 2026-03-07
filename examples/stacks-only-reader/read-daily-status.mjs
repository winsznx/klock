import {
  readStacksCompletedQuests,
  readStacksCurrentDay,
  readStacksDailyQuestStatus,
} from '@pulseprotocol/sdk'

const [address] = process.argv.slice(2)

if (!address) {
  console.error('Usage: node read-daily-status.mjs <stacks-address>')
  process.exit(1)
}

const network = address.startsWith('SP') ? 'mainnet' : 'testnet'
const currentDay = await readStacksCurrentDay({ network, sender: address })
const status = await readStacksDailyQuestStatus(address, currentDay, { network, sender: address })
const quests = await readStacksCompletedQuests(address, { network, sender: address })

console.log({ network, currentDay, status, quests })
