'use client'

import { wagmiAdapter, projectId } from '@/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { mainnet, arbitrum, base, sepolia } from '@reown/appkit/networks'
import React, { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'

// Set up queryClient
const queryClient = new QueryClient()

if (!projectId) {
    throw new Error('Project ID is not defined')
}

// Set up metadata
const metadata = {
    name: 'Social Ritual dApp',
    description: 'A daily social ritual engagement dApp on Base and Stacks',
    url: 'https://social-ritual.example.com', // origin must match your domain & subdomain
    icons: ['https://avatars.githubusercontent.com/u/179229932']
}

import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'
import { bitcoin, bitcoinTestnet } from '@reown/appkit/networks'

// Define adapters
const bitcoinAdapter = new BitcoinAdapter({
    projectId
})

// Create the modal
const modal = createAppKit({
    adapters: [wagmiAdapter, bitcoinAdapter],
    projectId,
    networks: [mainnet, arbitrum, base, sepolia, bitcoin, bitcoinTestnet],
    defaultNetwork: base,
    metadata: metadata,
    features: {
        analytics: true,
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
                {children}
            </QueryClientProvider>
        </WagmiProvider>
    )
}

export default ContextProvider
