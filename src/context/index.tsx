'use client'

import { wagmiAdapter, projectId } from '@/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'
import { defineChain } from '@reown/appkit/networks'
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

// Define Stacks Mainnet custom network
// CAIP-2 chain ID for Stacks Mainnet is "stacks:1"
const stacks = defineChain({
    id: 1,
    caipNetworkId: 'stacks:1',
    chainNamespace: 'stacks',
    name: 'Stacks Mainnet',
    nativeCurrency: {
        decimals: 6,
        name: 'Stacks',
        symbol: 'STX',
    },
    rpcUrls: {
        default: {
            http: ['https://api.mainnet.hiro.so'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Stacks Explorer',
            url: 'https://explorer.hiro.so'
        },
    },
})

// Define Stacks Testnet custom network
const stacksTestnet = defineChain({
    id: 2147483648,
    caipNetworkId: 'stacks:2147483648',
    chainNamespace: 'stacks',
    name: 'Stacks Testnet',
    nativeCurrency: {
        decimals: 6,
        name: 'Stacks',
        symbol: 'STX',
    },
    rpcUrls: {
        default: {
            http: ['https://api.testnet.hiro.so'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Stacks Explorer',
            url: 'https://explorer.hiro.so/?chain=testnet'
        },
    },
})

// Set up Bitcoin Adapter
// Note: BitcoinAdapter handles Bitcoin L1 and supports Stacks addresses via WalletConnect
const bitcoinAdapter = new BitcoinAdapter({
    projectId
})

// Create the modal with EVM, Bitcoin, and Stacks support
const modal = createAppKit({
    adapters: [wagmiAdapter, bitcoinAdapter],
    projectId,
    networks: [
        // Primary EVM Networks
        base,
        baseSepolia,
        // Additional EVM Networks
        mainnet, polygon, optimism, arbitrum, bsc, avalanche, celo, sepolia,
        // Bitcoin Networks
        bitcoin, bitcoinTestnet,
        // Stacks Networks
        stacks, stacksTestnet,
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
                <AuthProvider>
                    {children}
                </AuthProvider>
            </QueryClientProvider>
        </WagmiProvider>
    )
}

export default ContextProvider
