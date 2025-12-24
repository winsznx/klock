'use client'

import { useState, useEffect } from 'react'
import { Trophy, Medal, Award, ChevronDown, Users, Loader2, RefreshCw } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useStacks } from '@/context/StacksContext'
import { fetchLeaderboard, formatNumber, type LeaderboardEntry, type GlobalStats } from '@/lib/leaderboard'

// Network types
type NetworkFilter = 'all' | 'base' | 'stacks'

// Network badge component
function NetworkBadge({ network }: { network: 'base' | 'stacks' }) {
    const styles = network === 'base'
        ? 'bg-blue-100 text-blue-700 border-blue-200'
        : 'bg-purple-100 text-purple-700 border-purple-200'

    return (
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${styles}`}>
            {network === 'base' ? 'Base' : 'STX'}
        </span>
    )
}

// Rank badge component
function RankBadge({ rank }: { rank: number }) {
    if (rank === 1) {
        return (
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
                <Trophy className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
        )
    }
    if (rank === 2) {
        return (
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-lg">
                <Medal className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
        )
    }
    if (rank === 3) {
        return (
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
                <Award className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
        )
    }
    return (
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
            <span className="text-sm md:text-base font-bold text-gray-600">#{rank}</span>
        </div>
    )
}

export default function Leaderboard() {
    const [selectedNetwork, setSelectedNetwork] = useState<NetworkFilter>('all')
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
    const [stats, setStats] = useState<GlobalStats>({ totalUsers: 0, totalPoints: 0, highestStreak: 0, avgLevel: 0 })

    const { address: evmAddress } = useAuth()
    const { address: stacksAddress } = useStacks()

    // Get connected address based on network filter
    const getConnectedAddress = () => {
        if (selectedNetwork === 'base') return evmAddress
        if (selectedNetwork === 'stacks') return stacksAddress
        return stacksAddress || evmAddress
    }

    // Fetch leaderboard data
    const loadLeaderboard = async (showRefreshState = false) => {
        if (showRefreshState) {
            setIsRefreshing(true)
        } else {
            setIsLoading(true)
        }

        try {
            const connectedAddress = getConnectedAddress()
            const { entries, stats: fetchedStats } = await fetchLeaderboard(selectedNetwork, connectedAddress || undefined)
            setLeaderboardData(entries)
            setStats(fetchedStats)
        } catch (err) {
            console.error('[Leaderboard] Error loading data:', err)
        } finally {
            setIsLoading(false)
            setIsRefreshing(false)
        }
    }

    // Fetch on mount and when network changes
    useEffect(() => {
        loadLeaderboard()
    }, [selectedNetwork, evmAddress, stacksAddress])

    const networkOptions: { value: NetworkFilter; label: string; icon: string }[] = [
        { value: 'all', label: 'All Networks', icon: '🌐' },
        { value: 'base', label: 'Base', icon: '🔵' },
        { value: 'stacks', label: 'Stacks', icon: '🟣' },
    ]

    const selectedOption = networkOptions.find(opt => opt.value === selectedNetwork)

    // Check if current user is in the leaderboard
    const currentUserAddress = getConnectedAddress()
    const isCurrentUser = (address: string) => {
        if (!currentUserAddress) return false
        return address.toLowerCase() === currentUserAddress.toLowerCase() ||
            address === currentUserAddress
    }

    return (
        <div className="w-full">
            {/* Header with network filter */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-[#FF6B00] to-[#FF8533] rounded-xl flex items-center justify-center shadow-lg">
                        <Trophy className="text-white w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Leaderboard</h2>
                        <p className="text-sm text-gray-500">Top Pulsers by points</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Refresh Button */}
                    <button
                        onClick={() => loadLeaderboard(true)}
                        disabled={isRefreshing}
                        className="p-2.5 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-all disabled:opacity-50"
                        title="Refresh leaderboard"
                    >
                        <RefreshCw className={`w-4 h-4 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>

                    {/* Network Filter Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-gray-300 transition-all min-w-[160px]"
                        >
                            <span className="text-lg">{selectedOption?.icon}</span>
                            <span className="font-medium text-gray-700">{selectedOption?.label}</span>
                            <ChevronDown className={`w-4 h-4 text-gray-400 ml-auto transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-full min-w-[160px] bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                                {networkOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => {
                                            setSelectedNetwork(option.value)
                                            setIsDropdownOpen(false)
                                        }}
                                        className={`w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors ${selectedNetwork === option.value ? 'bg-orange-50 text-[#FF6B00]' : 'text-gray-700'
                                            }`}
                                    >
                                        <span className="text-lg">{option.icon}</span>
                                        <span className="font-medium">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Leaderboard Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Table Header */}
                <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
                    <div className="col-span-1">Rank</div>
                    <div className="col-span-4">Address</div>
                    <div className="col-span-2 text-center">Points</div>
                    <div className="col-span-2 text-center">Level</div>
                    <div className="col-span-2 text-center">Streak</div>
                    <div className="col-span-1 text-center">Network</div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin mb-3" />
                        <p className="text-gray-500">Loading leaderboard...</p>
                    </div>
                )}

                {/* Leaderboard Entries */}
                {!isLoading && leaderboardData.length > 0 && (
                    <div className="divide-y divide-gray-100">
                        {leaderboardData.map((entry, index) => (
                            <div
                                key={`${entry.network}-${entry.address}`}
                                className={`grid grid-cols-2 md:grid-cols-12 gap-3 md:gap-4 px-4 md:px-6 py-4 hover:bg-gray-50 transition-colors ${index < 3 ? 'bg-gradient-to-r from-orange-50/50 to-transparent' : ''
                                    } ${isCurrentUser(entry.address) ? 'ring-2 ring-[#FF6B00] ring-inset bg-orange-50' : ''}`}
                            >
                                {/* Rank */}
                                <div className="col-span-1 flex items-center">
                                    <RankBadge rank={entry.rank} />
                                </div>

                                {/* Address */}
                                <div className="col-span-1 md:col-span-4 flex items-center gap-2">
                                    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                                        <code className={`text-sm md:text-base font-mono px-2 py-1 rounded ${isCurrentUser(entry.address)
                                                ? 'bg-[#FF6B00] text-white'
                                                : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {entry.displayAddress}
                                            {isCurrentUser(entry.address) && ' (You)'}
                                        </code>
                                        <span className="md:hidden">
                                            <NetworkBadge network={entry.network} />
                                        </span>
                                    </div>
                                </div>

                                {/* Points */}
                                <div className="col-span-1 md:col-span-2 flex items-center md:justify-center">
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm text-gray-500 md:hidden">Points:</span>
                                        <span className="font-bold text-[#FF6B00]">{entry.totalPoints.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Level */}
                                <div className="col-span-1 md:col-span-2 flex items-center md:justify-center">
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm text-gray-500 md:hidden">Lvl:</span>
                                        <span className="font-semibold text-gray-700">{entry.level}</span>
                                    </div>
                                </div>

                                {/* Streak */}
                                <div className="hidden md:flex col-span-2 items-center justify-center">
                                    <div className="flex items-center gap-1">
                                        <span className="text-orange-500">🔥</span>
                                        <span className="font-semibold text-gray-700">{entry.streak} days</span>
                                    </div>
                                </div>

                                {/* Network Badge - Desktop only */}
                                <div className="hidden md:flex col-span-1 items-center justify-center">
                                    <NetworkBadge network={entry.network} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && leaderboardData.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <Users className="w-12 h-12 mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No data available</p>
                        <p className="text-sm">Be the first to join the leaderboard!</p>
                        <p className="text-xs text-gray-400 mt-2">Complete quests to appear here</p>
                    </div>
                )}
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6">
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">Total Pulsers</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalUsers)}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">Total Points</p>
                    <p className="text-2xl font-bold text-[#FF6B00]">{formatNumber(stats.totalPoints)}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">Highest Streak</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.highestStreak} 🔥</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                    <p className="text-sm text-gray-500 mb-1">Avg Level</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.avgLevel}</p>
                </div>
            </div>

            {/* Footer note */}
            <p className="text-center text-sm text-gray-400 mt-6">
                Live data from Base and Stacks contracts • Rankings based on total Pulse Points
            </p>
        </div>
    )
}
