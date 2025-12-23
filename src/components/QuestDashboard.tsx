'use client'

import React, { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import EngagementCard from './EngagementCard'
import ProtectedRoute from './ProtectedRoute'
import { motion } from 'framer-motion'
import {
    Zap, Globe, CloudSun, UserCheck, Clock,
    MessageSquare, Flame, Trophy, TrendingUp, Gift
} from 'lucide-react'

// Mock Data for the 10 functions
const INTERACTIONS = [
    { id: '1', name: 'Daily Check-In', desc: 'Secure your streak & get Pulse Points.', icon: Zap, points: 50 },
    { id: '2', name: 'Relay Signal', desc: 'Pass the torch to another timezone.', icon: Globe, points: 100 },
    { id: '3', name: 'Update Atmosphere', desc: 'Sync local weather to chain.', icon: CloudSun, points: 30 },
    { id: '4', name: 'Nudge Friend', desc: 'Ping a friend to save their streak.', icon: UserCheck, points: 40 },
    { id: '5', name: 'Mint Hour Badge', desc: 'Collect unique hour stamps.', icon: Clock, points: 60 },
    { id: '6', name: 'Commit Message', desc: 'Etch your mood on the ticker.', icon: MessageSquare, points: 20 },
    { id: '7', name: 'Stake for Streak', desc: 'High risk, high reward.', icon: Flame, points: 200, risk: true },
    { id: '8', name: 'Claim Milestone', desc: 'Evolve your profile level.', icon: Trophy, points: 500 },
    { id: '9', name: 'Predict Pulse', desc: "Vote on tomorrow's activity.", icon: TrendingUp, points: 80 },
    { id: '10', name: 'Open Capsule', desc: 'Reveal long-term rewards.', icon: Gift, points: 1000 },
]

function QuestContent() {
    const [completed, setCompleted] = useState<string[]>([])
    const [timestamps, setTimestamps] = useState<Record<string, number>>({})
    const [comboActive, setComboActive] = useState(false)

    // Combo Conditions: IDs 1, 3, 6 within 5 minutes
    const COMBO_IDS = ['1', '3', '6']
    const COMBO_WINDOW_MS = 5 * 60 * 1000

    const checkCombo = (currentTimestamps: Record<string, number>) => {
        const hasAll = COMBO_IDS.every(id => currentTimestamps[id])
        if (!hasAll) return

        const time1 = currentTimestamps['1']
        const time3 = currentTimestamps['3']
        const time6 = currentTimestamps['6']

        const minTime = Math.min(time1, time3, time6)
        const maxTime = Math.max(time1, time3, time6)

        if (maxTime - minTime <= COMBO_WINDOW_MS) {
            setComboActive(true)
        }
    }

    // Mock function handler
    const handleInteraction = (id: string) => {
        if (completed.includes(id)) return

        console.log(`Triggering function ${id}...`)

        // Optimistic update
        const now = Date.now()
        const newTimestamps = { ...timestamps, [id]: now }
        setTimestamps(newTimestamps)
        setCompleted(prev => [...prev, id])

        checkCombo(newTimestamps)
    }

    const progress = (completed.length / INTERACTIONS.length) * 100

    return (
        <div className="max-w-6xl mx-auto w-full">
            {/* Header Stats */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Quests</h1>
                    <p className="text-gray-500">Complete rituals to boost your global score.</p>
                </div>
                <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex flex-col text-right">
                        <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Progress</span>
                        <span className="text-xl font-bold text-[#FF6B00]">{completed.length} / 10</span>
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

            {/* Combo Banner */}
            {comboActive && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-8 bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-2xl shadow-lg flex items-center justify-between"
                >
                    <div>
                        <h3 className="text-2xl font-bold">🔥 DAILY TRIPLE ACTIVATED!</h3>
                        <p className="text-orange-100">You completed the ritual loop in under 5 minutes. 2x Multiplier applied.</p>
                    </div>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    >
                        <Flame size={48} className="text-yellow-300" />
                    </motion.div>
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
                        id={quest.id}
                        title={quest.name}
                        description={quest.desc}
                        icon={quest.icon}
                        points={quest.points}
                        streakRisk={quest.risk}
                        isCompleted={completed.includes(quest.id)}
                        onClick={() => handleInteraction(quest.id)}
                    />
                ))}
            </motion.div>
        </div>
    )
}

export default function QuestDashboard() {
    return (
        <ProtectedRoute>
            <QuestContent />
        </ProtectedRoute>
    )
}
