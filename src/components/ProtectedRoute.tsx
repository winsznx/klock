'use client'

import React from 'react'
import { useAuth } from '@/context/AuthContext'
import { Zap, Lock } from 'lucide-react'
import ConnectButton from './ConnectButton'

interface ProtectedRouteProps {
    children: React.ReactNode
    fallback?: React.ReactNode
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
    const { isLoggedIn, isConnected } = useAuth()

    // If logged in, show the protected content
    if (isLoggedIn) {
        return <>{children}</>
    }

    // Custom fallback if provided
    if (fallback) {
        return <>{fallback}</>
    }

    // Default fallback: Prompt to connect or login
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
            <div className="bg-gradient-to-br from-orange-100 to-orange-50 p-8 rounded-3xl border border-orange-200 shadow-xl max-w-md">
                <div className="bg-gradient-to-br from-[#FF6B00] to-[#FF8533] p-4 rounded-2xl mb-6 inline-block shadow-lg">
                    {isConnected ? (
                        <Lock size={40} className="text-white" />
                    ) : (
                        <Zap size={40} className="text-white" />
                    )}
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    {isConnected ? 'Login Required' : 'Connect Your Wallet'}
                </h2>

                <p className="text-gray-600 mb-6 leading-relaxed">
                    {isConnected
                        ? "You're connected! Click 'Login to App' to access the dashboard and start your daily rituals."
                        : 'Connect your wallet to join the global social heartbeat. Complete daily rituals, build streaks, and earn rewards.'
                    }
                </p>

                <ConnectButton />

                <div className="mt-6 pt-6 border-t border-orange-200">
                    <p className="text-xs text-gray-500">
                        Supports 20+ networks including Ethereum, Polygon, Base, Arbitrum, and more.
                    </p>
                </div>
            </div>
        </div>
    )
}
