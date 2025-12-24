'use client'

import { motion } from 'framer-motion'
import { LucideIcon, CheckCircle, Lock, Loader2 } from 'lucide-react'
import clsx from 'clsx'

interface EngagementCardProps {
    id: string
    title: string
    description: string
    icon: LucideIcon
    isLocked?: boolean
    isCompleted?: boolean
    isLoading?: boolean
    isDisabled?: boolean
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
    isLoading = false,
    isDisabled = false,
    onClick,
    streakRisk = false,
    points = 10,
}: EngagementCardProps) {
    const isInteractive = !isLocked && !isCompleted && !isLoading && !isDisabled

    return (
        <motion.div
            whileHover={{ scale: isInteractive ? 1.02 : 1 }}
            whileTap={{ scale: isInteractive ? 0.98 : 1 }}
            className={clsx(
                'card relative flex flex-col gap-4 transition-colors duration-200 select-none overflow-hidden',
                isLocked || isDisabled ? 'bg-gray-100 opacity-60 cursor-not-allowed' : '',
                isInteractive && 'cursor-pointer hover:border-[#FF6B00]',
                isCompleted && 'border-green-500 bg-green-50',
                isLoading && 'border-orange-300 bg-orange-50'
            )}
            onClick={isInteractive ? onClick : undefined}
        >
            <div className="flex justify-between items-start">
                <div className={clsx(
                    "p-3 rounded-xl",
                    isCompleted ? "bg-green-100 text-green-600" :
                        isLoading ? "bg-orange-100 text-orange-600" :
                            isDisabled ? "bg-gray-100 text-gray-400" :
                                "bg-orange-50 text-[#FF6B00]"
                )}>
                    {isLoading ? (
                        <Loader2 size={24} className="animate-spin" />
                    ) : (
                        <Icon size={24} />
                    )}
                </div>
                {isCompleted && <CheckCircle className="text-green-500" size={24} />}
                {isLocked && <Lock className="text-gray-400" size={24} />}
                {isDisabled && !isLocked && <Lock className="text-gray-300" size={20} />}
            </div>

            <div>
                <h3 className={clsx(
                    "text-lg font-bold",
                    isDisabled ? "text-gray-400" : "text-gray-900"
                )}>{title}</h3>
                <p className={clsx(
                    "text-sm mt-1",
                    isDisabled ? "text-gray-300" : "text-gray-500"
                )}>{description}</p>
            </div>

            <div className="mt-auto flex justify-between items-center text-xs font-medium">
                <span className={isDisabled ? "text-gray-400" : "text-[#FF6B00]"}>
                    +{points} Pulse Points
                </span>
                {streakRisk && <span className="text-red-500">Risk Item</span>}
                {isDisabled && !streakRisk && <span className="text-gray-400">Coming Soon</span>}
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

            {isLoading && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-orange-50/80 backdrop-blur-[1px] flex items-center justify-center z-10"
                >
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                        <Loader2 size={16} className="animate-spin text-[#FF6B00]" />
                        <span className="font-bold text-[#FF6B00]">Processing...</span>
                    </div>
                </motion.div>
            )}
        </motion.div>
    )
}
