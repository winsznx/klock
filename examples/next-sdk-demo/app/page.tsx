import { readBaseGlobalStats } from '@winsznx/sdk'
import { PulseDashboard } from '../components/pulse-dashboard'

export default async function HomePage() {
  const stats = await readBaseGlobalStats({ network: 'mainnet' })

  return (
    <main style={{ display: 'grid', gap: 24, padding: 32 }}>
      <section>
        <h1>PULSE Next.js Demo</h1>
        <p>Server-side SDK read plus client-side React integration.</p>
        <pre>{JSON.stringify({
          totalUsers: stats.totalUsers.toString(),
          totalCheckins: stats.totalCheckins.toString(),
          totalPointsDistributed: stats.totalPointsDistributed.toString(),
        }, null, 2)}</pre>
      </section>
      <PulseDashboard />
    </main>
  )
}
