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
    bitcoinTestnet,
} from '@reown/appkit/networks'
import React, { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'
import { AuthProvider } from './AuthContext'
import { StacksProvider } from './StacksContext'

// Set up queryClient
const queryClient = new QueryClient()

if (!projectId) {
    throw new Error('Project ID is not defined')
}

// Set up metadata
const metadata = {
    name: 'PULSE - Social Ritual dApp',
    description: 'A daily social ritual engagement dApp on Base and Stacks',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://klock-jade.vercel.app',
    icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// Set up Bitcoin Adapter
// Note: BitcoinAdapter handles Bitcoin L1 only
// Stacks is handled separately via StacksProvider using @stacks/connect
const bitcoinAdapter = new BitcoinAdapter({
    projectId
})

// Create the modal with EVM and Bitcoin support
// Stacks uses a separate connection flow via @stacks/connect
const modal = createAppKit({
    adapters: [wagmiAdapter, bitcoinAdapter],
    projectId,
    networks: [
        // Primary EVM Networks
        base,
        baseSepolia,
        // Additional EVM Networks
        mainnet, polygon, optimism, arbitrum, bsc, avalanche, celo, sepolia,
        // Bitcoin Networks (L1 only - not Stacks)
        bitcoin, bitcoinTestnet
    ],
    defaultNetwork: base,
    metadata: metadata,
    // Disable auto-reconnect to prevent wallet auto-triggering
    enableReconnect: false,
    features: {
        analytics: true,
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
                <StacksProvider>
                    <AuthProvider>
                        {children}
                    </AuthProvider>
                </StacksProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}

export default ContextProvider
