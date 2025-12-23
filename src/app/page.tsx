import ConnectButton from '@/components/ConnectButton'
import HeroActions from '@/components/HeroActions'
import { Zap, Globe, Users, TrendingUp, Shield, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F5F5F5] via-[#FFF0E6] to-[#F5F5F5]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-[#FF6B00] to-[#FF8533] rounded-lg flex items-center justify-center shadow-lg">
              <Zap className="text-white" size={20} />
            </div>
            <span className="font-bold text-xl md:text-2xl tracking-tight text-gray-900">PULSE</span>
          </div>
          <ConnectButton />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="space-y-6 md:space-y-8 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-orange-100 text-[#FF6B00] px-4 py-2 rounded-full text-sm font-semibold">
                <Sparkles size={16} />
                <span>Join the Global Heartbeat</span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Your Daily Ritual,
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-[#FF8533]">
                  On-Chain
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl">
                PULSE is a social coordination game where thousands sync their daily check-ins across timezones.
                Complete rituals, build streaks, earn rewards, and become part of the world's first decentralized heartbeat.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <HeroActions />
                <button className="px-6 py-3 bg-white border-2 border-gray-200 rounded-full font-semibold text-gray-900 hover:border-[#FF6B00] hover:text-[#FF6B00] transition-all duration-200 shadow-sm">
                  Learn More ↓
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-8">
                <div className="text-center md:text-left">
                  <div className="text-2xl md:text-3xl font-bold text-[#FF6B00]">12K+</div>
                  <div className="text-sm text-gray-500">Active Users</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-2xl md:text-3xl font-bold text-[#FF6B00]">500K+</div>
                  <div className="text-sm text-gray-500">Check-ins</div>
                </div>
                <div className="text-center md:text-left">
                  <div className="text-2xl md:text-3xl font-bold text-[#FF6B00]">20+</div>
                  <div className="text-sm text-gray-500">Networks</div>
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-8 md:p-12 shadow-2xl">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="relative space-y-6">
                  <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <Zap className="text-white" size={24} />
                      </div>
                      <div>
                        <div className="text-white font-semibold">Daily Check-In</div>
                        <div className="text-orange-100 text-sm">+50 Points</div>
                      </div>
                    </div>
                    <div className="text-2xl">✓</div>
                  </div>

                  <div className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <Globe className="text-white" size={24} />
                      </div>
                      <div>
                        <div className="text-white font-semibold">Relay Signal</div>
                        <div className="text-orange-100 text-sm">+100 Points</div>
                      </div>
                    </div>
                    <div className="text-2xl">⏳</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">Streak</span>
                      <span className="text-orange-100 text-2xl font-bold">🔥 7</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-white h-2 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Why PULSE?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              More than just a check-in app. PULSE is a social experiment in global coordination,
              powered by blockchain technology.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-orange-50 to-white p-6 md:p-8 rounded-2xl border border-orange-100 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#FF6B00] to-[#FF8533] rounded-xl flex items-center justify-center mb-4">
                <Zap className="text-white" size={24} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Daily Rituals</h3>
              <p className="text-gray-600 leading-relaxed">
                Complete 10 unique on-chain interactions daily. From check-ins to weather syncs,
                each action strengthens the global pulse and earns you points.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-blue-50 to-white p-6 md:p-8 rounded-2xl border border-blue-100 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Globe className="text-white" size={24} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Multi-Chain</h3>
              <p className="text-gray-600 leading-relaxed">
                Connect from 20+ blockchain networks including Ethereum, Polygon, Base, Arbitrum,
                Optimism, and more. Your ritual, your chain.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-purple-50 to-white p-6 md:p-8 rounded-2xl border border-purple-100 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <Users className="text-white" size={24} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Social Coordination</h3>
              <p className="text-gray-600 leading-relaxed">
                Nudge friends, relay signals across timezones, and unlock combo multipliers.
                The more coordinated, the bigger the rewards.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-green-50 to-white p-6 md:p-8 rounded-2xl border border-green-100 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="text-white" size={24} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Build Streaks</h3>
              <p className="text-gray-600 leading-relaxed">
                Maintain your daily streak to unlock exclusive badges, multipliers, and rare NFT rewards.
                Miss a day? Friends can save you.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-red-50 to-white p-6 md:p-8 rounded-2xl border border-red-100 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4">
                <Shield className="text-white" size={24} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Stake & Earn</h3>
              <p className="text-gray-600 leading-relaxed">
                High-risk, high-reward staking options. Commit to your streak and earn massive
                multipliers. Break it, and you lose your stake.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-yellow-50 to-white p-6 md:p-8 rounded-2xl border border-yellow-100 hover:shadow-xl transition-all duration-300">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="text-white" size={24} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">Rare Rewards</h3>
              <p className="text-gray-600 leading-relaxed">
                Collect time-stamped NFT badges, unlock mystery capsules, and claim milestone rewards.
                Every action is permanently recorded on-chain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 md:py-20 px-4 md:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Getting started with PULSE is simple. Follow these steps to join the global heartbeat.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#FF6B00] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                1
              </div>
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-lg h-full">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 mt-4">Connect Wallet</h3>
                <p className="text-gray-600 leading-relaxed">
                  Click "Connect Wallet" and choose from 20+ supported networks.
                  We support all major chains including Ethereum, Polygon, Base, and more.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#FF6B00] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                2
              </div>
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-lg h-full">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 mt-4">Complete Rituals</h3>
                <p className="text-gray-600 leading-relaxed">
                  Choose from 10 daily quests. Each interaction is recorded on-chain and earns you
                  Pulse Points. Complete combos for multipliers!
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#FF6B00] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                3
              </div>
              <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-200 shadow-lg h-full">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 mt-4">Earn Rewards</h3>
                <p className="text-gray-600 leading-relaxed">
                  Build streaks, unlock badges, and claim exclusive NFT rewards.
                  The longer your streak, the rarer your rewards become.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 px-4 md:px-8 bg-gradient-to-r from-[#FF6B00] to-[#FF8533]">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg md:text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Connect your wallet, complete daily rituals, and become part of the world's first decentralized social heartbeat.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <HeroActions />
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#FF6B00] rounded-full font-semibold hover:bg-orange-50 transition-all duration-200 shadow-lg"
            >
              View Dashboard
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B00] to-[#FF8533] rounded-lg flex items-center justify-center">
                  <Zap className="text-white" size={24} />
                </div>
                <span className="font-bold text-2xl">PULSE</span>
              </div>
              <p className="text-gray-400 max-w-md leading-relaxed">
                The world's first decentralized social heartbeat. Join thousands in daily on-chain rituals
                across 20+ blockchain networks.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-[#FF6B00] transition-colors">About</a></li>
                <li><a href="#" className="hover:text-[#FF6B00] transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-[#FF6B00] transition-colors">Rewards</a></li>
                <li><a href="#" className="hover:text-[#FF6B00] transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-[#FF6B00] transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-[#FF6B00] transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-[#FF6B00] transition-colors">GitHub</a></li>
                <li><a href="#" className="hover:text-[#FF6B00] transition-colors">Docs</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 PULSE. All rights reserved. Built by Tim for the global community.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
