import assert from 'node:assert/strict'
import test from 'node:test'

import {
  QUEST_IDS,
  getStacksCompletedQuests,
  isBaseChain,
  isBaseTestnetChain,
  readStacksCompletedQuests,
  readStacksCurrentDay,
  readStacksDailyQuestStatus,
  readStacksUserProfile,
} from '../dist/index.js'
import {
  currentDayResponse,
  dailyQuestStatusResponse,
  userProfileResponse,
} from './fixtures/stacks-readonly.mjs'

const TEST_STACKS_ADDRESS = 'ST31DP8F8CF2GXSZBHHHK5J6Y061744E1TP7FRGHT'

async function withMockedFetch(queue, callback) {
  const originalFetch = globalThis.fetch
  let callCount = 0

  globalThis.fetch = async () => {
    const payload = queue[callCount]
    callCount += 1

    return {
      ok: true,
      json: async () => payload,
    }
  }

  try {
    await callback()
    assert.equal(callCount, queue.length)
  } finally {
    globalThis.fetch = originalFetch
  }
}

test('base helpers detect supported chains', () => {
  assert.equal(isBaseChain(8453), true)
  assert.equal(isBaseChain(84532), true)
  assert.equal(isBaseChain(1), false)
  assert.equal(isBaseTestnetChain(84532), true)
  assert.equal(isBaseTestnetChain(8453), false)
})

test('stacks quest bitmap decodes completed quests', () => {
  const quests = getStacksCompletedQuests(74)

  assert.deepEqual(quests, [
    QUEST_IDS.DAILY_CHECKIN,
    QUEST_IDS.UPDATE_ATMOSPHERE,
    QUEST_IDS.COMMIT_MESSAGE,
  ])
})

test('stacks read helpers parse current day, profile, and daily status', async () => {
  await withMockedFetch([currentDayResponse], async () => {
    const day = await readStacksCurrentDay({ network: 'testnet', sender: TEST_STACKS_ADDRESS })
    assert.equal(day, 42)
  })

  await withMockedFetch([dailyQuestStatusResponse], async () => {
    const status = await readStacksDailyQuestStatus(TEST_STACKS_ADDRESS, 42, {
      network: 'testnet',
      sender: TEST_STACKS_ADDRESS,
    })

    assert.deepEqual(status, {
      completedQuests: 74,
      firstQuestBlock: 128,
      comboActivated: true,
      exists: true,
    })
  })

  await withMockedFetch([userProfileResponse], async () => {
    const profile = await readStacksUserProfile(TEST_STACKS_ADDRESS, {
      network: 'testnet',
      sender: TEST_STACKS_ADDRESS,
    })

    assert.deepEqual(profile, {
      totalPoints: 1200,
      currentStreak: 7,
      longestStreak: 11,
      lastCheckinBlock: 555,
      totalCheckins: 33,
      level: 4,
      exists: true,
    })
  })
})

test('readStacksCompletedQuests composes the day and status readers', async () => {
  await withMockedFetch([currentDayResponse, dailyQuestStatusResponse], async () => {
    const quests = await readStacksCompletedQuests(TEST_STACKS_ADDRESS, {
      network: 'testnet',
      sender: TEST_STACKS_ADDRESS,
    })

    assert.deepEqual(quests, [
      QUEST_IDS.DAILY_CHECKIN,
      QUEST_IDS.UPDATE_ATMOSPHERE,
      QUEST_IDS.COMMIT_MESSAGE,
    ])
  })
})
