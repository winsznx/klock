import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import './globals.css'
import ContextProvider from '@/context'
import { headers } from 'next/headers'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PULSE | Social Ritual & Streak-Based Engagement Protocol',
  description: 'Synchronize your daily rhythm with the global social heartbeat. Complete on-chain rituals, maintain streaks, and earn Pulse Points across the Base and Stacks ecosystems.',
  keywords: [
    'Web3', 'Social Protocol', 'Daily Rituals', 'Stacks', 'Bitcoin Layers', 'Base', 'Layer 2',
    'Gamified Finance', 'On-chain Streaks', 'Social Coordination', 'Pulse Protocol'
  ],
  authors: [{ name: 'PULSE Protocol Team', url: 'https://pulse.social' }],
  creator: 'PULSE Protocol',
  publisher: 'PULSE Protocol',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://pulse.social',
    title: 'PULSE | Social Ritual & Streak-Based Engagement',
    description: 'The social coordination protocol for daily on-chain engagement across Base and Stacks.',
    siteName: 'PULSE',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PULSE Protocol',
    description: 'Join the global on-chain social heartbeat on Base and Stacks.',
    creator: '@pulsestatus',
  },
  robots: {
    index: true,
    follow: true,
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

