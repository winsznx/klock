'use client'

import { wagmiAdapter, projectId } from '@/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'
import {
    mainnet,
    arbitrum,
    base,
    sepolia,
    polygon,
    optimism,
    avalanche,
    bsc,
    celo,
    baseSepolia,
    bitcoin,
    bitcoinTestnet
} from '@reown/appkit/networks'
import React, { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'
import { AuthProvider } from './AuthContext'

// Set up queryClient
const queryClient = new QueryClient()

if (!projectId) {
    throw new Error('Project ID is not defined')
}

// Set up metadata
const metadata = {
    name: 'PULSE - Social Ritual dApp',
    description: 'A daily social ritual engagement dApp on Base and multi-chain',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://klock-jade.vercel.app',
    icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// Set up Bitcoin Adapter (for Leather, Xverse, etc.)
const bitcoinAdapter = new BitcoinAdapter({
    projectId
})

// Create the modal with both EVM and Bitcoin support
const modal = createAppKit({
    adapters: [wagmiAdapter, bitcoinAdapter],
    projectId,
    networks: [
        // EVM Networks
        mainnet, polygon, optimism, arbitrum, base, bsc, avalanche, celo, sepolia, baseSepolia,
        // Bitcoin Networks
        bitcoin, bitcoinTestnet
    ],
    defaultNetwork: base,
    metadata: metadata,
    // CRITICAL: Disable auto-reconnect to prevent Leather wallet from auto-triggering on page load
    enableReconnect: false,
    features: {
        analytics: true,
        // Disable email and social login to prevent auto-connect behaviors
        email: false,
        socials: []
    },
    themeMode: 'light',
    themeVariables: {
        '--w3m-accent': '#FF6B00',
        '--w3m-border-radius-master': '1px'
    }
})

function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
    const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}

export default ContextProvider
