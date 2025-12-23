'use client'

import { motion } from 'framer-motion'
import { LucideIcon, CheckCircle, Lock } from 'lucide-react'
import clsx from 'clsx'

interface EngagementCardProps {
    id: string
    title: string
    description: string
    icon: LucideIcon
    isLocked?: boolean
    isCompleted?: boolean
    onClick?: () => void
    streakRisk?: boolean
    points?: number
}

export default function EngagementCard({
    title,
    description,
    icon: Icon,
    isLocked = false,
    isCompleted = false,
    onClick,
    streakRisk = false,
    points = 10,
}: EngagementCardProps) {
    return (
        <motion.div
            whileHover={{ scale: isLocked ? 1 : 1.02 }}
            whileTap={{ scale: isLocked ? 1 : 0.98 }}
            className={clsx(
                'card relative flex flex-col gap-4 transition-colors duration-200 select-none overflow-hidden',
                isLocked ? 'bg-gray-100 opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-[#FF6B00]',
                isCompleted && 'border-green-500 bg-green-50'
            )}
            onClick={!isLocked && !isCompleted ? onClick : undefined}
        >
            <div className="flex justify-between items-start">
                <div className={clsx("p-3 rounded-xl", isCompleted ? "bg-green-100 text-green-600" : "bg-orange-50 text-[#FF6B00]")}>
                    <Icon size={24} />
                </div>
                {isCompleted && <CheckCircle className="text-green-500" size={24} />}
                {isLocked && <Lock className="text-gray-400" size={24} />}
            </div>

            <div>
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 mt-1">{description}</p>
            </div>

            <div className="mt-auto flex justify-between items-center text-xs font-medium">
                <span className="text-[#FF6B00]">+{points} Pulse Points</span>
                {streakRisk && <span className="text-red-500">Risk Item</span>}
            </div>

            {isCompleted && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-white/20 backdrop-blur-[1px] flex items-center justify-center z-10"
                >
                    <span className="bg-white px-4 py-2 rounded-full shadow-sm font-bold text-green-600">
                        Done
                    </span>
                </motion.div>
            )}
        </motion.div>
    )
}
