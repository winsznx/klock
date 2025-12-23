'use client'

import { useAppKit, useDisconnect } from '@reown/appkit/react'
import { useRouter } from 'next/navigation'
import { LogOut, Wallet, LogIn, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function ConnectButton() {
    const { open } = useAppKit()
    // Use Reown's useDisconnect instead of wagmi's - works for all chains including Bitcoin
    const { disconnect } = useDisconnect()
    const { isConnected, address, isLoggedIn, login, logout } = useAuth()
    const router = useRouter()
    const [mounted, setMounted] = useState(false)

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    const handleLoginAndNavigate = () => {
        login()
        router.push('/dashboard')
    }

    if (!mounted) return <div className="h-10 w-32 bg-gray-200 rounded-full animate-pulse" />

    // State 1: Not connected - show Connect Wallet button
    if (!isConnected || !address) {
        return (
            <button
                onClick={() => open()}
                className="flex items-center gap-2 bg-gradient-to-r from-[#FF6B00] to-[#ff8533] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all duration-200"
            >
                <Wallet size={18} />
                Connect Wallet
            </button>
        )
    }

    // State 2: Connected but not logged in - show address + Login to App button
    if (!isLoggedIn) {
        return (
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                    <Wallet size={16} className="text-gray-500" />
                    <button onClick={() => open()} className="text-sm font-medium text-gray-700 hover:underline">
                        {address.slice(0, 6)}...{address.slice(-4)}
                    </button>
                    <button
                        onClick={() => disconnect()}
                        className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
                        title="Disconnect"
                    >
                        <LogOut size={14} />
                    </button>
                </div>
                <button
                    onClick={handleLoginAndNavigate}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#FF6B00] to-[#ff8533] text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all duration-200"
                >
                    <LogIn size={16} />
                    Login to App
                </button>
            </div>
        )
    }

    // State 3: Connected and logged in - show address with user indicator and logout
    return (
        <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                    <User size={12} className="text-white" />
                </div>
                <button onClick={() => open()} className="text-sm font-medium text-green-900 hover:underline">
                    {address.slice(0, 6)}...{address.slice(-4)}
                </button>
            </div>
            <button
                onClick={() => {
                    logout()
                    disconnect()
                }}
                className="p-1 rounded-full text-green-500 hover:text-green-700 hover:bg-green-100 transition-colors"
                title="Logout & Disconnect"
            >
                <LogOut size={14} />
            </button>
        </div>
    )
}
