/**
 * Leaderboard API utilities
 * Fetches user data from Base and Stacks contracts to build leaderboard
 */

import { BASE_CONTRACTS, STACKS_CONTRACTS, PULSE_ABI } from '@/config/contracts'
import { createPublicClient, http } from 'viem'
import { base, baseSepolia } from 'viem/chains'
import { cvToHex, principalCV, hexToCV, ClarityType } from '@stacks/transactions'

export type NetworkFilter =
    | 'all'
    | 'base-mainnet'
    | 'base-testnet'
    | 'stacks-mainnet'
    | 'stacks-testnet'

export interface LeaderboardEntry {
    rank: number
    address: string
    displayAddress: string
    totalPoints: number
    level: number
    streak: number
    network: 'base' | 'stacks'
    isTestnet: boolean
}

export interface GlobalStats {
    totalUsers: number
    totalPoints: number
    highestStreak: number
    avgLevel: number
}

// Known active addresses (in production, you'd get these from events/indexer)
const KNOWN_ADDRESSES = {
    baseMainnet: [
        '0xcF0A164b64b92Fa6262e312cDB60a12c302e8F1c', // Contract deployer
    ],
    baseTestnet: [
        '0x22E7AA46aDDF743c99322212852dB2FA17b404b2', // Testnet contract
    ],
    stacksMainnet: [
        'SP2KZ109PC2HRFH8T37ZDBVAQF2DK38RTXQSBK80T',
    ],
    stacksTestnet: [
        'ST31DP8F8CF2GXSZBHHHK5J6Y061744E1TP7FRGHT',
    ],
}

// Create Base public clients for reading contracts
const baseMainnetClient = createPublicClient({
    chain: base,
    transport: http(BASE_CONTRACTS.mainnet.rpcUrl),
})

const baseTestnetClient = createPublicClient({
    chain: baseSepolia,
    transport: http(BASE_CONTRACTS.testnet.rpcUrl),
})

/**
 * Fetch user profile from Base contract
 */
async function fetchBaseUserProfile(
    address: string,
    isTestnet: boolean
): Promise<LeaderboardEntry | null> {
    try {
        const client = isTestnet ? baseTestnetClient : baseMainnetClient
        const contractAddress = isTestnet
            ? BASE_CONTRACTS.testnet.address
            : BASE_CONTRACTS.mainnet.address

        const result = await client.readContract({
            address: contractAddress,
            abi: PULSE_ABI,
            functionName: 'getUserProfile',
            args: [address as `0x${string}`],
        }) as any

        if (!result || !result.exists) return null

        return {
            rank: 0,
            address: address,
            displayAddress: `${address.slice(0, 6)}...${address.slice(-4)}`,
            totalPoints: Number(result.totalPoints || 0),
            level: Number(result.level || 1),
            streak: Number(result.currentStreak || 0),
            network: 'base',
            isTestnet,
        }
    } catch (err) {
        console.error(`[Leaderboard] Error fetching Base profile for ${address}:`, err)
        return null
    }
}

/**
 * Fetch user profile from Stacks contract
 */
async function fetchStacksUserProfile(
    address: string,
    isTestnet: boolean
): Promise<LeaderboardEntry | null> {
    try {
        const contractInfo = isTestnet
            ? STACKS_CONTRACTS.testnet
            : STACKS_CONTRACTS.mainnet

        const response = await fetch(
            `${contractInfo.apiUrl}/v2/contracts/call-read/${contractInfo.contractAddress}/${contractInfo.contractName}/get-user-profile`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender: address,
                    arguments: [cvToHex(principalCV(address))],
                }),
            }
        )

        if (!response.ok) return null

        const data = await response.json()
        if (!data.okay || data.result === '0x09') return null

        const cv = hexToCV(data.result) as any
        if ((cv.type === 'some' || cv.type === ClarityType.OptionalSome) && cv.value) {
            const tuple = cv.value
            const profileData = tuple.value || tuple.data

            if (profileData) {
                return {
                    rank: 0,
                    address: address,
                    displayAddress: `${address.slice(0, 6)}...${address.slice(-4)}`,
                    totalPoints: Number(profileData['total-points']?.value ?? 0),
                    level: Number(profileData['level']?.value ?? 1),
                    streak: Number(profileData['current-streak']?.value ?? 0),
                    network: 'stacks',
                    isTestnet,
                }
            }
        }

        return null
    } catch (err) {
        console.error(`[Leaderboard] Error fetching Stacks profile for ${address}:`, err)
        return null
    }
}

/**
 * Fetch Base global stats
 */
async function fetchBaseGlobalStats(isTestnet: boolean): Promise<{ totalUsers: number; totalPoints: number } | null> {
    try {
        const client = isTestnet ? baseTestnetClient : baseMainnetClient
        const contractAddress = isTestnet
            ? BASE_CONTRACTS.testnet.address
            : BASE_CONTRACTS.mainnet.address

        const result = await client.readContract({
            address: contractAddress,
            abi: PULSE_ABI,
            functionName: 'getGlobalStats',
            args: [],
        }) as any

        return {
            totalUsers: Number(result[0] || 0),
            totalPoints: Number(result[2] || 0),
        }
    } catch (err) {
        console.error('[Leaderboard] Error fetching Base global stats:', err)
        return null
    }
}

/**
 * Fetch leaderboard data from contracts
 */
export async function fetchLeaderboard(
    network: NetworkFilter,
    connectedAddress?: string
): Promise<{ entries: LeaderboardEntry[]; stats: GlobalStats }> {
    const entries: LeaderboardEntry[] = []
    const fetchPromises: Promise<void>[] = []

    // Determine which networks to fetch
    const fetchBaseMainnet = network === 'all' || network === 'base-mainnet'
    const fetchBaseTestnet = network === 'all' || network === 'base-testnet'
    const fetchStacksMainnet = network === 'all' || network === 'stacks-mainnet'
    const fetchStacksTestnet = network === 'all' || network === 'stacks-testnet'

    // Fetch Base Mainnet
    if (fetchBaseMainnet) {
        const addresses = [...KNOWN_ADDRESSES.baseMainnet]
        if (connectedAddress?.startsWith('0x') && !addresses.includes(connectedAddress)) {
            addresses.push(connectedAddress)
        }
        fetchPromises.push(
            Promise.all(addresses.map(addr => fetchBaseUserProfile(addr, false)))
                .then(profiles => {
                    entries.push(...profiles.filter((p): p is LeaderboardEntry => p !== null && p.totalPoints > 0))
                })
        )
    }

    // Fetch Base Testnet
    if (fetchBaseTestnet) {
        const addresses = [...KNOWN_ADDRESSES.baseTestnet]
        if (connectedAddress?.startsWith('0x') && !addresses.includes(connectedAddress)) {
            addresses.push(connectedAddress)
        }
        fetchPromises.push(
            Promise.all(addresses.map(addr => fetchBaseUserProfile(addr, true)))
                .then(profiles => {
                    entries.push(...profiles.filter((p): p is LeaderboardEntry => p !== null && p.totalPoints > 0))
                })
        )
    }

    // Fetch Stacks Mainnet
    if (fetchStacksMainnet) {
        const addresses = [...KNOWN_ADDRESSES.stacksMainnet]
        if (connectedAddress?.startsWith('SP') && !addresses.includes(connectedAddress)) {
            addresses.push(connectedAddress)
        }
        fetchPromises.push(
            Promise.all(addresses.map(addr => fetchStacksUserProfile(addr, false)))
                .then(profiles => {
                    entries.push(...profiles.filter((p): p is LeaderboardEntry => p !== null && p.totalPoints > 0))
                })
        )
    }

    // Fetch Stacks Testnet
    if (fetchStacksTestnet) {
        const addresses = [...KNOWN_ADDRESSES.stacksTestnet]
        if (connectedAddress?.startsWith('ST') && !addresses.includes(connectedAddress)) {
            addresses.push(connectedAddress)
        }
        fetchPromises.push(
            Promise.all(addresses.map(addr => fetchStacksUserProfile(addr, true)))
                .then(profiles => {
                    entries.push(...profiles.filter((p): p is LeaderboardEntry => p !== null && p.totalPoints > 0))
                })
        )
    }

    // Wait for all fetches
    await Promise.all(fetchPromises)

    // Sort by total points descending
    entries.sort((a, b) => b.totalPoints - a.totalPoints)

    // Assign ranks
    entries.forEach((entry, idx) => {
        entry.rank = idx + 1
    })

    // Calculate stats
    const stats: GlobalStats = {
        totalUsers: entries.length,
        totalPoints: entries.reduce((sum, e) => sum + e.totalPoints, 0),
        highestStreak: Math.max(...entries.map(e => e.streak), 0),
        avgLevel: entries.length > 0
            ? Math.round((entries.reduce((sum, e) => sum + e.level, 0) / entries.length) * 10) / 10
            : 0,
    }

    // Try to get actual global stats from Base (mainnet first, then testnet)
    if (fetchBaseMainnet) {
        const baseStats = await fetchBaseGlobalStats(false)
        if (baseStats) {
            stats.totalUsers = Math.max(stats.totalUsers, baseStats.totalUsers)
            stats.totalPoints = Math.max(stats.totalPoints, baseStats.totalPoints)
        }
    } else if (fetchBaseTestnet) {
        const baseStats = await fetchBaseGlobalStats(true)
        if (baseStats) {
            stats.totalUsers = Math.max(stats.totalUsers, baseStats.totalUsers)
            stats.totalPoints = Math.max(stats.totalPoints, baseStats.totalPoints)
        }
    }

    return { entries, stats }
}

/**
 * Format large numbers for display
 */
export function formatNumber(num: number): string {
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`
    }
    return num.toLocaleString()
}

/**
 * Network filter options for UI
 */
export const NETWORK_OPTIONS: { value: NetworkFilter; label: string; icon: string; color: string }[] = [
    { value: 'all', label: 'All Networks', icon: '🌐', color: 'gray' },
    { value: 'base-mainnet', label: 'Base', icon: '🔵', color: 'blue' },
    { value: 'base-testnet', label: 'Base Sepolia', icon: '🔵', color: 'blue' },
    { value: 'stacks-mainnet', label: 'Stacks', icon: '🟣', color: 'purple' },
    { value: 'stacks-testnet', label: 'Stacks Testnet', icon: '🟣', color: 'purple' },
]
