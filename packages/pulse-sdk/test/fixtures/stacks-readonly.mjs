import { cvToHex, someCV, trueCV, tupleCV, uintCV } from '@stacks/transactions'

export const currentDayResponse = {
  okay: true,
  result: cvToHex(uintCV(42)),
}

export const dailyQuestStatusResponse = {
  okay: true,
  result: cvToHex(someCV(tupleCV({
    'completed-quests': uintCV(74),
    'first-quest-block': uintCV(128),
    'combo-activated': trueCV(),
  }))),
}

export const userProfileResponse = {
  okay: true,
  result: cvToHex(someCV(tupleCV({
    'total-points': uintCV(1200),
    'current-streak': uintCV(7),
    'longest-streak': uintCV(11),
    'last-checkin-block': uintCV(555),
    'total-checkins': uintCV(33),
    level: uintCV(4),
  }))),
}
