'use client'

import { useStacks } from '@/context/StacksContext'
import { Loader2, Wallet } from 'lucide-react'

interface StacksConnectButtonProps {
    className?: string
    variant?: 'primary' | 'secondary'
}

export default function StacksConnectButton({
    className = '',
    variant = 'primary'
}: StacksConnectButtonProps) {
    const { isConnected, address, connect, disconnect, isLoading } = useStacks()

    if (Boolean(isLoading)) {
        return (
            <button
                type="button"
                disabled
                aria-busy="true"
                className={`flex items-center gap-2 px-6 py-3 bg-gray-300 text-gray-500 rounded-full font-semibold cursor-not-allowed ${className}`}
            >
                <Loader2 className="animate-spin" size={20} />
                Loading...
            </button>
        )
    }

    if (Boolean(isConnected && address)) {
        return (
            <button
                type="button"
                onClick={disconnect}
                aria-label="Disconnect Stacks wallet"
                className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full font-semibold hover:shadow-xl transition-all duration-200 shadow-lg ${className}`}
            >
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                {address.slice(0, 6)}...{address.slice(-4)}
            </button>
        )
    }

    // Primary variant - gradient orange
    if (variant === 'primary') {
        return (
            <button
                type="button"
                onClick={connect}
                className={`flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full font-semibold hover:shadow-xl transition-all duration-200 shadow-lg transform hover:-translate-y-0.5 ${className}`}
            >
                <Wallet size={20} />
                Connect Stacks Wallet
            </button>
        )
    }

    // Secondary variant - outlined
    return (
        <button
            type="button"
            onClick={connect}
            className={`flex items-center gap-2 px-6 py-3 bg-white border-2 border-purple-600 text-purple-600 rounded-full font-semibold hover:bg-purple-50 transition-all duration-200 ${className}`}
        >
            <Wallet size={20} />
            Connect Stacks
        </button>
    )
}
