'use client'

import { useStacks } from '@/context/StacksContext'
import { Loader2 } from 'lucide-react'

interface StacksConnectButtonProps {
    className?: string
}

/**
 * Button component for connecting Stacks wallet via @stacks/connect
 * Works with Leather, Xverse, and other Stacks wallets
 * Supports WalletConnect QR code for mobile wallets
 */
export default function StacksConnectButton({ className = '' }: StacksConnectButtonProps) {
    const {
        isConnected,
        address,
        isMainnet,
        isLoading,
        connectWallet,
        disconnectWallet,
        error
    } = useStacks()

    if (isConnected && address) {
        return (
            <div className={`flex items-center gap-3 ${className}`}>
                <div className="flex flex-col text-right">
                    <span className="text-xs text-gray-400">
                        Stacks {isMainnet ? 'Mainnet' : 'Testnet'}
                    </span>
                    <span className="text-sm font-mono text-gray-700">
                        {address.slice(0, 6)}...{address.slice(-4)}
                    </span>
                </div>
                <button
                    onClick={disconnectWallet}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                >
                    Disconnect
                </button>
            </div>
        )
    }

    return (
        <div className={`${className}`}>
            <button
                onClick={connectWallet}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Connecting...
                    </>
                ) : (
                    <>
                        <svg
                            viewBox="0 0 24 24"
                            className="w-5 h-5"
                            fill="currentColor"
                        >
                            <path d="M12 2L4 6v12l8 4 8-4V6l-8-4zm0 2.18l6 3v9.64l-6 3-6-3V7.18l6-3z" />
                        </svg>
                        Connect Stacks Wallet
                    </>
                )}
            </button>
            {error && (
                <p className="mt-2 text-sm text-red-500">{error}</p>
            )}
        </div>
    )
}
