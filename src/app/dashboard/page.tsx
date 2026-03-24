'use client'

import { useAuth } from '@/context/AuthContext'
import { useStacks } from '@/context/StacksContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import QuestDashboard from '@/components/QuestDashboard'
import { Zap, LogOut, User, Home, Trophy } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
    const { isLoggedIn, address: evmAddress, logout: evmLogout } = useAuth()
    const { isConnected: isStacksConnected, address: stacksAddress, disconnect: stacksDisconnect } = useStacks()
    const router = useRouter()

    // User is authenticated if logged in via EVM OR connected via Stacks
    const isAuthenticated = isLoggedIn || isStacksConnected
    const displayAddress = stacksAddress || evmAddress

    // Redirect to home if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/')
        }
    }, [isAuthenticated, router])

    // Handle logout for both wallet types
    const handleLogout = () => {
        if (isStacksConnected) {
            stacksDisconnect()
        }
        if (isLoggedIn) {
            evmLogout()
        }
        router.push('/')
    }

    // Show loading while checking auth state
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#F5F5F5] via-[#FFF0E6] to-[#F5F5F5] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#FF6B00] to-[#FF8533] rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <Zap className="text-white" size={32} />
                    </div>
                    <p className="text-gray-600">Redirecting...</p>
                </div>
            </div>
        )
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-[#F5F5F5] via-[#FFF0E6] to-[#F5F5F5]">
            {/* Dashboard Navigation */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
                <div className="flex justify-between items-center max-w-7xl mx-auto px-4 md:px-8 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#FF6B00] to-[#FF8533] rounded-lg flex items-center justify-center shadow-lg">
                                <Zap className="text-white" size={20} />
                            </div>
                            <span className="font-bold text-xl md:text-2xl tracking-tight text-gray-900">PULSE</span>
                        </Link>
                        <div className="flex items-center gap-2">
                            <span className="hidden md:inline-block px-3 py-1 bg-orange-100 text-[#FF6B00] text-xs font-semibold rounded-full">
                                Dashboard
                            </span>
                            <Link
                                href="/leaderboard"
                                className="hidden md:flex items-center gap-1 px-3 py-1 text-gray-600 hover:text-[#FF6B00] hover:bg-orange-50 text-xs font-semibold rounded-full transition-colors"
                            >
                                <Trophy size={14} />
                                Leaderboard
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* User Info */}
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${isStacksConnected
                            ? 'bg-purple-50 border-purple-200'
                            : 'bg-green-50 border-green-200'
                            }`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isStacksConnected
                                ? 'bg-gradient-to-br from-purple-400 to-purple-600'
                                : 'bg-gradient-to-br from-green-400 to-green-600'
                                }`}>
                                <User size={12} className="text-white" />
                            </div>
                            <span className={`text-sm font-medium ${isStacksConnected ? 'text-purple-900' : 'text-green-900'
                                }`}>
                                {displayAddress?.slice(0, 6)}...{displayAddress?.slice(-4)}
                            </span>
                            {isStacksConnected && (
                                <span className="text-xs text-purple-600 font-medium">STX</span>
                            )}
                        </div>

                        {/* Home Link */}
                        <Link
                            href="/"
                            aria-label="Go to home page"
                            className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            title="Back to Home"
                        >
                            <Home size={20} />
                        </Link>

                        {/* Logout */}
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Logout"
                        >
                            <LogOut size={18} />
                            <span className="hidden sm:inline text-sm font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Dashboard Content */}
            <section className="py-8 md:py-12 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Welcome Banner */}
                    <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8533] rounded-2xl p-6 md:p-8 mb-8 text-white shadow-xl">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, Pulser! 👋</h1>
                        <p className="text-orange-100 text-sm md:text-base">
                            Complete your daily rituals to maintain your streak and earn rewards.
                        </p>
                    </div>

                    {/* Quest Dashboard Component */}
                    <QuestDashboard />
                </div>
            </section>
        </main>
    )
}
