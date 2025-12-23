'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import ConnectButton from './ConnectButton'
import { ArrowRight, LogIn } from 'lucide-react'

export default function HeroActions() {
    const { isConnected, isLoggedIn, login } = useAuth()
    const router = useRouter()

    const handleLoginAndNavigate = () => {
        login()
        // Navigate to dashboard after login
        router.push('/dashboard')
    }

    const goToDashboard = () => {
        router.push('/dashboard')
    }

    // State 3: Logged in - show Enter App button that navigates to dashboard
    if (isLoggedIn) {
        return (
            <button
                onClick={goToDashboard}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF6B00] to-[#FF8533] text-white rounded-full font-semibold hover:shadow-xl transition-all duration-200 shadow-lg transform hover:-translate-y-0.5"
            >
                Enter Dashboard
                <ArrowRight size={20} />
            </button>
        )
    }

    // State 2: Connected but not logged in - show Login to App button
    if (isConnected) {
        return (
            <button
                onClick={handleLoginAndNavigate}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF6B00] to-[#FF8533] text-white rounded-full font-semibold hover:shadow-xl transition-all duration-200 shadow-lg transform hover:-translate-y-0.5"
            >
                <LogIn size={20} />
                Login to App
            </button>
        )
    }

    // State 1: Not connected - show Connect Wallet button
    return <ConnectButton />
}
