import { cookieStorage, createStorage } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import {
    mainnet,
    arbitrum,
    base,
    sepolia,
    polygon,
    optimism,
    avalanche,
    bsc,
    gnosis,
    zkSync,
    polygonZkEvm,
    celo,
    aurora,
    // Testnets
    polygonAmoy,
    optimismSepolia,
    baseSepolia,
    arbitrumSepolia,
    avalancheFuji,
    bscTestnet
} from '@reown/appkit/networks'

// Get projectId from https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID

if (!projectId) {
    throw new Error('NEXT_PUBLIC_PROJECT_ID is not defined')
}

// Comprehensive network support for multiple chains
export const networks = [
    // Mainnets
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    bsc,
    avalanche,
    gnosis,
    zkSync,
    polygonZkEvm,
    celo,
    aurora,
    // Testnets
    sepolia,
    polygonAmoy,
    optimismSepolia,
    baseSepolia,
    arbitrumSepolia,
    avalancheFuji,
    bscTestnet
]

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
    storage: createStorage({
        storage: cookieStorage
    }),
    ssr: true,
    projectId,
    networks
})

export const config = wagmiAdapter.wagmiConfig
