'use client'

import { wagmiAdapter, projectId } from '@/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
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
    baseSepolia
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

// Create the modal - EVM chains only (no Bitcoin adapter to prevent Leather auto-trigger)
const modal = createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: [mainnet, polygon, optimism, arbitrum, base, bsc, avalanche, celo, sepolia, baseSepolia],
    defaultNetwork: base,
    metadata: metadata,
    features: {
        analytics: true,
        email: false,
        socials: false,
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

