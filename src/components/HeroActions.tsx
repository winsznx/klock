'use client'

import { useAuth } from '@/context/AuthContext'
import { useStacks } from '@/context/StacksContext'
import Link from 'next/link'
import ConnectButton from './ConnectButton'
import StacksConnectButton from './StacksConnectButton'
import { ArrowRight } from 'lucide-react'

export default function HeroActions() {
    const { isLoggedIn } = useAuth()
    const { isConnected: isStacksConnected } = useStacks()

    // If user is logged in (either EVM or Stacks), show Enter Dashboard
    if (isLoggedIn || isStacksConnected) {
        return (
            <Link
                href="/dashboard"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF6B00] to-[#FF8533] text-white rounded-full font-semibold hover:shadow-xl transition-all duration-200 shadow-lg transform hover:-translate-y-0.5"
            >
                Enter Dashboard
                <ArrowRight size={20} />
            </Link>
        )
    }

    // Not connected - show both wallet options
    return (
        <div className="flex flex-col sm:flex-row gap-3">
            {/* EVM/Base wallet via AppKit */}
            <ConnectButton />

            {/* Stacks wallet via @stacks/connect */}
            <StacksConnectButton />
        </div>
    )
}
