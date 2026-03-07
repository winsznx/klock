'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { base, baseSepolia } from '@reown/appkit/networks'
import { PulseAuthProvider, PulseStacksProvider } from '@winsznx/react'
import { WagmiProvider } from 'wagmi'
import { wagmiAdapter, projectId } from '../lib/pulse-config'

const queryClient = new QueryClient()

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  metadata: {
    name: 'PULSE Next SDK Demo',
    description: 'Example app for the PULSE SDK and React package',
    url: 'http://localhost:3000',
    icons: ['https://avatars.githubusercontent.com/u/179229932'],
  },
  networks: [base, baseSepolia],
  defaultNetwork: base,
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <PulseStacksProvider>
          <PulseAuthProvider>{children}</PulseAuthProvider>
        </PulseStacksProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
