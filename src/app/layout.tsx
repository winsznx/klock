import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'
import ContextProvider from '@/context'
import { headers } from 'next/headers'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PULSE - Social Ritual dApp | Daily On-Chain Engagement',
  description: 'Join the global social heartbeat. Complete daily rituals, build streaks, and earn rewards across 20+ blockchain networks. PULSE is a social coordination game where thousands sync their check-ins across timezones.',
  keywords: ['Web3', 'dApp', 'Social', 'Blockchain', 'Daily Ritual', 'NFT', 'Multi-chain', 'Ethereum', 'Polygon', 'Base', 'Arbitrum'],
  authors: [{ name: 'winszn' }],
  creator: 'Tim',
  publisher: 'Tim',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://klock-jade.vercel.app',
    title: 'PULSE - Social Ritual dApp',
    description: 'Join thousands in daily on-chain rituals across 20+ blockchain networks.',
    siteName: 'PULSE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PULSE - Social Ritual dApp',
    description: 'Join the global social heartbeat. Complete daily rituals and earn rewards.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/icon.png',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersObj = await headers()
  const cookies = headersObj.get('cookie')

  return (
    <html lang="en">
      <body className={spaceGrotesk.className}>
        <ContextProvider cookies={cookies}>{children}</ContextProvider>
      </body>
    </html>
  )
}

