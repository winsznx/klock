'use client'

import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { base, baseSepolia } from '@reown/appkit/networks'

const projectIdValue = process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectIdValue) {
  throw new Error('NEXT_PUBLIC_PROJECT_ID is required')
}

export const projectId = projectIdValue

export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  projectId,
  networks: [base, baseSepolia],
})
