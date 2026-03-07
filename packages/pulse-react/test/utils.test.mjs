import assert from 'node:assert/strict'
import test from 'node:test'

import { QUEST_IDS } from '../../pulse-sdk/dist/index.js'
import {
  createPulseAuthStorageKey,
  hasDailyCombo,
  hasStacksDailyCombo,
  normalizeBaseUserProfile,
  normalizeStacksUserProfile,
  resolveActivePulseContract,
  truncateAddress,
} from '../dist/utils.js'
import { baseProfile } from './fixtures/base-profile.mjs'
import { stacksProfile } from './fixtures/stacks-profile.mjs'

test('auth utility creates stable localStorage keys', () => {
  assert.equal(createPulseAuthStorageKey(), 'pulse_logged_in_address')
  assert.equal(createPulseAuthStorageKey('demo'), 'demo_logged_in_address')
})

test('address utility truncates long addresses and preserves short values', () => {
  assert.equal(truncateAddress('0x1234567890abcdef'), '0x1234...cdef')
  assert.equal(truncateAddress('short'), 'short')
})

test('profile normalization creates unified shapes', () => {
  assert.deepEqual(normalizeBaseUserProfile(baseProfile), {
    totalPoints: 1250,
    currentStreak: 5,
    longestStreak: 9,
    level: 3,
    totalCheckins: 21,
    exists: true,
  })

  assert.deepEqual(normalizeStacksUserProfile(stacksProfile), {
    totalPoints: 980,
    currentStreak: 8,
    longestStreak: 12,
    level: 6,
    totalCheckins: 30,
    exists: true,
  })
})

test('contract resolution prefers stacks over appkit base sessions', () => {
  assert.equal(resolveActivePulseContract({
    stacksConnected: true,
    appKitConnected: true,
    baseNetwork: true,
  }), 'stacks')

  assert.equal(resolveActivePulseContract({
    stacksConnected: false,
    appKitConnected: true,
    baseNetwork: true,
  }), 'base')

  assert.equal(resolveActivePulseContract({
    stacksConnected: false,
    appKitConnected: true,
    baseNetwork: false,
  }), 'none')
})

test('combo helpers detect the daily trio', () => {
  const completed = new Set([
    QUEST_IDS.DAILY_CHECKIN,
    QUEST_IDS.UPDATE_ATMOSPHERE,
    QUEST_IDS.COMMIT_MESSAGE,
  ])

  assert.equal(hasDailyCombo((questId) => completed.has(questId)), true)
  assert.equal(hasStacksDailyCombo(stacksProfile.questBitmap), true)
  assert.equal(hasStacksDailyCombo(0), false)
})
