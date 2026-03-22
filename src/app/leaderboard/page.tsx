'use client'

import { useAuth } from '@/context/AuthContext'
import { useStacks } from '@/context/StacksContext'
import { Zap, LogOut, Home, Trophy } from 'lucide-react'
import Link from 'next/link'
import Leaderboard from '@/components/Leaderboard'

export default function LeaderboardPage() {
    const { isLoggedIn, address: evmAddress, logout: evmLogout } = useAuth()
    const { isConnected: isStacksConnected, address: stacksAddress, disconnect: stacksDisconnect } = useStacks()

    const isAuthenticated = isLoggedIn || isStacksConnected
    const displayAddress = stacksAddress || evmAddress

    // Handle logout for both wallet types
    const handleLogout = () => {
        if (isStacksConnected) {
            stacksDisconnect()
        }
        if (isLoggedIn) {
            evmLogout()
        }
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-[#F5F5F5] via-[#FFF0E6] to-[#F5F5F5]">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
                <div className="flex justify-between items-center max-w-7xl mx-auto px-4 md:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#FF6B00] to-[#FF8533] rounded-lg flex items-center justify-center shadow-lg">
                                <Zap className="text-white" size={20} />
                            </div>
                            <span className="font-bold text-lg md:text-xl text-gray-900 hidden sm:block">PULSE</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Link
                                href="/dashboard"
                                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Dashboard
                            </Link>
                            <span className="px-3 py-1.5 text-sm font-semibold text-[#FF6B00] bg-orange-50 rounded-lg">
                                Leaderboard
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {isAuthenticated && displayAddress && (
                            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border ${isStacksConnected
                                    ? 'bg-purple-50 border-purple-200'
                                    : 'bg-green-50 border-green-200'
                                }`}>
                                <div className={`w-2 h-2 rounded-full ${isStacksConnected ? 'bg-purple-500' : 'bg-green-500'}`} />
                                <code className="text-sm font-mono">
                                    {displayAddress.slice(0, 6)}...{displayAddress.slice(-4)}
                                </code>
                                {isStacksConnected && (
                                    <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">STX</span>
                                )}
                            </div>
                        )}

                        <Link
                            href="/"
                            aria-label="Go to home page"
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Home"
                        >
                            <Home className="w-5 h-5 text-gray-600" />
                        </Link>

                        {isAuthenticated && (
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <LogOut size={18} />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Page Content */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
                {/* Page Header */}
                <div className="mb-8">
                    <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8533] rounded-2xl p-6 md:p-8 text-white shadow-xl">
                        <div className="flex items-center gap-4 mb-3">
                            <Trophy className="w-8 h-8 md:w-10 md:h-10" />
                            <h1 className="text-2xl md:text-3xl font-bold">Global Leaderboard</h1>
                        </div>
                        <p className="text-white/80 md:text-lg max-w-2xl">
                            See how you stack up against other Pulsers across Base and Stacks networks.
                            Complete daily rituals to climb the ranks!
                        </p>
                    </div>
                </div>

                {/* Leaderboard Component */}
                <Leaderboard />
            </div>

            {/* Footer */}
            <footer className="border-t border-gray-200 bg-white/50 mt-12">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 text-center text-sm text-gray-500">
                    <p>© 2026 PULSE. Building the future of social rituals on Bitcoin L2s.</p>
                </div>
            </footer>
        </main>
    )
}
