'use client'

import React, { useState, useEffect, useCallback } from 'react'
import EngagementCard from './EngagementCard'
import { motion } from 'framer-motion'
import {
    Zap, Globe, CloudSun, UserCheck, Clock,
    MessageSquare, Flame, Trophy, TrendingUp, Gift, AlertCircle, Loader2
} from 'lucide-react'
import { QUEST_IDS, COMBO_QUEST_IDS, type PulseContractFunction } from '@winsznx/sdk'
import { useUnifiedContract } from '@/hooks/useUnifiedContract'

// Quest definitions matching contract QUEST_IDS
const INTERACTIONS = [
    { id: QUEST_IDS.DAILY_CHECKIN, name: 'Daily Check-In', desc: 'Secure your streak & get Pulse Points.', icon: Zap, points: 50, action: 'dailyCheckin' as PulseContractFunction },
    { id: QUEST_IDS.RELAY_SIGNAL, name: 'Relay Signal', desc: 'Pass the torch to another timezone.', icon: Globe, points: 100, action: 'relaySignal' as PulseContractFunction },
    { id: QUEST_IDS.UPDATE_ATMOSPHERE, name: 'Update Atmosphere', desc: 'Sync local weather to chain.', icon: CloudSun, points: 30, action: 'updateAtmosphere' as PulseContractFunction },
    { id: QUEST_IDS.NUDGE_FRIEND, name: 'Nudge Friend', desc: 'Ping a friend to save their streak.', icon: UserCheck, points: 40, action: 'nudgeFriend' as PulseContractFunction },
    { id: QUEST_IDS.MINT_HOUR_BADGE, name: 'Mint Hour Badge', desc: 'Unlock time-stamped proof of activity. Phase 2 early access.', icon: Clock, points: 60, action: 'mintHourBadge' as any, disabled: true },
    { id: QUEST_IDS.COMMIT_MESSAGE, name: 'Commit Message', desc: 'Etch your mood on the ticker.', icon: MessageSquare, points: 20, action: 'commitMessage' as PulseContractFunction },
    { id: QUEST_IDS.STAKE_STREAK, name: 'Stake for Streak', desc: 'Pledge STX to double multipliers. V2 Beta.', icon: Flame, points: 200, risk: true, action: 'stakeStreak' as any, disabled: true },
    { id: QUEST_IDS.CLAIM_MILESTONE, name: 'Claim Milestone', desc: 'Level up your soulbound identity.', icon: Trophy, points: 500, action: 'claimMilestone' as any, disabled: true },
    { id: QUEST_IDS.PREDICT_PULSE, name: 'Predict Pulse', desc: "Vote on tomorrow's activity levels.", icon: TrendingUp, points: 80, action: 'predictPulse' as PulseContractFunction },
    { id: QUEST_IDS.OPEN_CAPSULE, name: 'Open Capsule', desc: 'Seasonal loot boxes. Season 1 ending soon.', icon: Gift, points: 1000, action: 'openCapsule' as any, disabled: true },
]


// Combo quest IDs for "Daily Triple"
const COMBO_IDS = [...COMBO_QUEST_IDS]

export default function QuestDashboard() {
    const {
        isConnected,
        activeContract,
        chainType,
        contractInfo,
        userProfile,
        isLoading,
        error,
        dailyCheckin,
        relaySignal,
        updateAtmosphere,
        nudgeFriend,
        commitMessage,
        predictPulse,
        claimDailyCombo,
        isQuestCompleted,
        checkComboAvailable,
        refreshData,
        stacksAddress,
    } = useUnifiedContract()

    const [pendingQuest, setPendingQuest] = useState<number | null>(null)
    const [localError, setLocalError] = useState<string | null>(null)
    const [comboActive, setComboActive] = useState<boolean>(false)
    const [showMessageInput, setShowMessageInput] = useState<boolean>(false)
    const [message, setMessage] = useState('')
    const [showFriendInput, setShowFriendInput] = useState<boolean>(false)
    const [friendAddress, setFriendAddress] = useState('')

    // Check combo availability
    useEffect(() => {
        const checkCombo = async () => {
            const available = await checkComboAvailable()
            setComboActive(available)
        }
        if (isConnected) {
            checkCombo()
        }
    }, [isConnected, checkComboAvailable])

    // Calculate completed quests
    const completedQuests = INTERACTIONS.filter(q => isQuestCompleted(q.id)).map(q => q.id)
    const progress = (completedQuests.length / INTERACTIONS.length) * 100

    // Handle quest interaction
    const handleInteraction = useCallback(async (questId: number, action: PulseContractFunction) => {
        if (!isConnected || activeContract === 'none') {
            setLocalError('Please connect to a supported network (Base or Stacks)')
            return
        }

        if (isQuestCompleted(questId)) {
            setLocalError('Quest already completed today')
            return
        }

        // Handle special input cases
        if (action === 'commitMessage' && !showMessageInput) {
            setShowMessageInput(true)
            return
        }
        if (action === 'nudgeFriend' && !showFriendInput) {
            setShowFriendInput(true)
            return
        }

        setPendingQuest(questId)
        setLocalError(null)

        try {
            let result: { success: boolean; error?: string }

            switch (action) {
                case 'dailyCheckin':
                    result = await dailyCheckin()
                    break
                case 'relaySignal':
                    result = await relaySignal()
                    break
                case 'updateAtmosphere':
                    // Use a random weather code 1-10
                    const weatherCode = Math.floor(Math.random() * 10) + 1
                    result = await updateAtmosphere(weatherCode)
                    break
                case 'nudgeFriend':
                    if (!friendAddress) {
                        setLocalError('Please enter a friend address')
                        setPendingQuest(null)
                        return
                    }
                    result = await nudgeFriend(friendAddress)
                    setShowFriendInput(false)
                    setFriendAddress('')
                    break
                case 'commitMessage':
                    if (!message) {
                        setLocalError('Please enter a message')
                        setPendingQuest(null)
                        return
                    }
                    result = await commitMessage(message)
                    setShowMessageInput(false)
                    setMessage('')
                    break
                case 'predictPulse':
                    // Predict a random level 1-10 (matching stacks contract range)
                    const level = Math.floor(Math.random() * 10) + 1
                    result = await predictPulse(level)
                    break

                default:
                    result = { success: false, error: 'Quest not yet implemented' }
            }

            if (!result.success && result.error) {
                setLocalError(result.error)
            } else if (result.success) {
                // Refresh data after successful transaction
                await refreshData()
            }
        } catch (err) {
            setLocalError(err instanceof Error ? err.message : 'Transaction failed')
        } finally {
            setPendingQuest(null)
        }
    }, [isConnected, activeContract, isQuestCompleted, dailyCheckin, relaySignal,
        updateAtmosphere, nudgeFriend, commitMessage, predictPulse, refreshData,
        showMessageInput, message, showFriendInput, friendAddress])

    // Handle claiming combo
    const handleClaimCombo = useCallback(async () => {
        if (!comboActive) return

        setPendingQuest(-1) // Special ID for combo
        try {
            const result = await claimDailyCombo()
            if (!result.success && result.error) {
                setLocalError(result.error)
            } else {
                setComboActive(false)
                await refreshData()
            }
        } catch (err) {
            setLocalError(err instanceof Error ? err.message : 'Failed to claim combo')
        } finally {
            setPendingQuest(null)
        }
    }, [comboActive, claimDailyCombo, refreshData])

    return (
        <div className="w-full">
            {/* Network Info Banner */}
            {isConnected && (
                <div role="status" className="mb-6 bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div aria-hidden="true" className={`w-3 h-3 rounded-full ${activeContract === 'none' ? 'bg-red-500' : 'bg-green-500'
                            }`} />
                        <div>
                            <span className="text-sm font-medium text-gray-700">
                                {activeContract === 'base' && 'Connected to Base'}
                                {activeContract === 'stacks' && `Connected to Stacks (${stacksAddress?.slice(0, 8)}...)`}
                                {activeContract === 'none' && 'Unsupported Network'}
                            </span>
                            {contractInfo.contractAddress && (
                                <p className="text-xs text-gray-500">
                                    Contract: {contractInfo.contractAddress.slice(0, 10)}...
                                    {contractInfo.network === 'testnet' &&
                                        <span className="ml-2 text-orange-600">(Testnet)</span>}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={refreshData}
                        disabled={isLoading}
                        aria-label="Refresh quest data"
                        title="Refresh quest data"
                        className="text-sm text-[#FF6B00] hover:underline disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
                    </button>
                </div>
            )}


            {/* User Stats */}
            {userProfile && (
                <div className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-xs text-gray-400 uppercase font-bold">Total Points</p>
                        <p className="text-2xl font-bold text-[#FF6B00]">{userProfile.totalPoints.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-xs text-gray-400 uppercase font-bold">Current Streak</p>
                        <p className="text-2xl font-bold text-gray-900">{userProfile.currentStreak} days</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-xs text-gray-400 uppercase font-bold">Longest Streak</p>
                        <p className="text-2xl font-bold text-gray-900">{userProfile.longestStreak} days</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-xs text-gray-400 uppercase font-bold">Level</p>
                        <p className="text-2xl font-bold text-purple-600">{userProfile.level}</p>
                    </div>
                </div>
            )}

            {/* Header Stats */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Daily Quests</h2>
                    <p className="text-gray-500">Complete rituals to boost your global score.</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex flex-col text-right">
                        <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Progress</span>
                        <span className="text-xl font-bold text-[#FF6B00]">{completedQuests.length} / 10</span>
                    </div>
                    <div className="w-16 h-16 relative">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="32" cy="32" r="28" stroke="#E5E5E5" strokeWidth="4" fill="none" />
                            <circle
                                cx="32" cy="32" r="28"
                                stroke="#FF6B00" strokeWidth="4" fill="none"
                                strokeDasharray={175}
                                strokeDashoffset={175 - (175 * progress) / 100}
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {(error || localError) && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="alert"
                    className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3"
                >
                    <AlertCircle className="w-5 h-5" />
                    <p>{error || localError}</p>
                    <button
                        type="button"
                        onClick={() => setLocalError(null)}
                        className="ml-auto text-sm underline"
                    >
                        Dismiss
                    </button>
                </motion.div>
            )}

            {/* Combo Banner */}
            {comboActive && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    role="status"
                    className="mb-8 bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between"
                >
                    <div>
                        <h3 className="text-2xl font-bold">DAILY TRIPLE AVAILABLE!</h3>
                        <p className="text-orange-100">Complete Check-In, Atmosphere & Message for +200 bonus points.</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClaimCombo}
                        disabled={pendingQuest === -1}
                        aria-label="Claim daily combo bonus"
                        className="bg-white text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 disabled:opacity-50"
                    >
                        {pendingQuest === -1 ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Claim Bonus'}
                    </button>
                </motion.div>
            )}

            {/* Message Input Modal */}
            {showMessageInput && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-6 bg-white border border-gray-200 p-6 rounded-2xl shadow-lg"
                >
                    <label htmlFor="quest-message-input" className="font-bold text-gray-900 mb-3 block">Commit Your Message</label>
                    <input
                        id="quest-message-input"
                        autoFocus
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="What's on your mind? (max 280 chars)"
                        maxLength={280}
                        className="w-full p-3 border border-gray-200 rounded-xl mb-4"
                    />
                    <p className="text-xs text-gray-500 mb-4">{message.length} / 280 characters</p>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => handleInteraction(6, 'commitMessage')}
                            disabled={!message || pendingQuest === 6}
                            className="bg-[#FF6B00] text-white px-6 py-2 rounded-xl font-medium disabled:opacity-50"
                        >
                            {pendingQuest === 6 ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setShowMessageInput(false); setMessage('') }}
                            className="text-gray-500 px-6 py-2"
                        >
                            Cancel
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Friend Address Input Modal */}
            {showFriendInput && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-6 bg-white border border-gray-200 p-6 rounded-2xl shadow-lg"
                >
                    <label htmlFor="quest-friend-input" className="font-bold text-gray-900 mb-3 block">Nudge a Friend</label>
                    <input
                        id="quest-friend-input"
                        autoFocus
                        type="text"
                        value={friendAddress}
                        onChange={(e) => setFriendAddress(e.target.value)}
                        placeholder={activeContract === 'stacks' ? 'SP... or ST...' : '0x...'}
                        autoComplete="off"
                        className="w-full p-3 border border-gray-200 rounded-xl mb-4 font-mono text-sm"
                    />
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => handleInteraction(4, 'nudgeFriend')}
                            disabled={!friendAddress || pendingQuest === 4}
                            className="bg-[#FF6B00] text-white px-6 py-2 rounded-xl font-medium disabled:opacity-50"
                        >
                            {pendingQuest === 4 ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Nudge'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setShowFriendInput(false); setFriendAddress('') }}
                            className="text-gray-500 px-6 py-2"
                        >
                            Cancel
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Quest Grid */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
                {INTERACTIONS.map((quest) => (
                    <EngagementCard
                        key={quest.id}
                        id={quest.id.toString()}
                        title={quest.name}
                        description={quest.desc}
                        icon={quest.icon}
                        points={quest.points}
                        streakRisk={quest.risk}
                        isCompleted={isQuestCompleted(quest.id)}
                        isLoading={pendingQuest === quest.id}
                        isDisabled={quest.disabled || !isConnected}
                        onClick={() => handleInteraction(quest.id, quest.action)}
                    />
                ))}
            </motion.div>
        </div>
    )
}
