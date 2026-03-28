'use client'

import { wagmiAdapter, projectId, networks } from '@/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { BitcoinAdapter } from '@reown/appkit-adapter-bitcoin'
import { base } from '@reown/appkit/networks'
import React, { type ReactNode } from 'react'
import dynamic from 'next/dynamic'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'
import { AuthProvider } from './AuthContext'

// Set up queryClient
const queryClient = new QueryClient()

if (!projectId) {
    throw new Error('Project ID is not defined')
}

// Set up metadata
const metadata = {
    name: 'PULSE Protocol',
    description: 'The social coordination protocol for daily on-chain rituals.',
    url: 'https://pulse.social',
    icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// Set up Bitcoin Adapter
const bitcoinAdapter = new BitcoinAdapter({
    projectId
})

// Create the modal with EVM, Bitcoin, and Stacks support
// Uses universalProviderConfigOverride to request Stacks methods from wallets
const modal = createAppKit({
    adapters: [wagmiAdapter, bitcoinAdapter],
    projectId,
    networks: networks as [any, ...any[]],
    defaultNetwork: base,
    metadata: metadata,
    features: {
        analytics: true,
        email: false,
        socials: []
    },
    // Configure Universal Provider to request Stacks methods
    // This tells WalletConnect to ask the wallet to enable these methods
    universalProviderConfigOverride: {
        methods: {
            // Default Bitcoin methods
            bip122: [
                'sendTransfer',
                'signMessage',
                'signPsbt',
                'getAccountAddresses'
            ],
            // Stacks methods - these are the RPC methods for Stacks transactions
            stacks: [
                'stx_getAddresses',
                'stx_transferStx',
                'stx_signTransaction',
                'stx_callContract',
                'stx_signMessage',
                'stx_signStructuredMessage'
            ]
        },
        chains: {
            bip122: ['bip122:000000000019d6689c085ae165831e93', 'bip122:000000000933ea01ad0ee984209779ba'],
            stacks: ['stacks:1', 'stacks:2147483648']
        },
        events: {
            bip122: ['accountsChanged', 'chainChanged'],
            stacks: ['accountsChanged', 'chainChanged']
        },
        rpcMap: {
            'stacks:1': 'https://api.mainnet.hiro.so',
            'stacks:2147483648': 'https://api.testnet.hiro.so'
        }
    },
    themeMode: 'light',
    themeVariables: {
        '--w3m-accent': '#FF6B00',
        '--w3m-border-radius-master': '1px'
    }
})

function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
    const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

    // Import StacksProvider dynamically to avoid SSR issues
    const StacksProviderWrapper = dynamic(
        () => import('./StacksContext').then(mod => mod.StacksProvider),
        { ssr: false }
    )

    return (
        <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
            <QueryClientProvider client={queryClient}>
                <StacksProviderWrapper>
                    <AuthProvider>
                        {children}
                    </AuthProvider>
                </StacksProviderWrapper>
            </QueryClientProvider>
        </WagmiProvider>
    )
}

export default ContextProvider
