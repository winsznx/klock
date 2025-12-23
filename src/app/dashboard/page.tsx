'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import QuestDashboard from '@/components/QuestDashboard'
import ConnectButton from '@/components/ConnectButton'
import { Zap, LogOut, User, Home } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
    const { isLoggedIn, isConnected, address, logout } = useAuth()
    const router = useRouter()

    // Redirect to home if not logged in
    useEffect(() => {
        if (!isLoggedIn) {
            router.push('/')
        }
    }, [isLoggedIn, router])

    // Show loading while checking auth state
    if (!isLoggedIn) {
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
                        <span className="hidden md:inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            Dashboard
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* User Info */}
                        <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                            <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                                <User size={12} className="text-white" />
                            </div>
                            <span className="text-sm font-medium text-green-900">
                                {address?.slice(0, 6)}...{address?.slice(-4)}
                            </span>
                        </div>

                        {/* Home Link */}
                        <Link
                            href="/"
                            className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                            title="Back to Home"
                        >
                            <Home size={20} />
                        </Link>

                        {/* Logout */}
                        <button
                            onClick={() => {
                                logout()
                                router.push('/')
                            }}
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
