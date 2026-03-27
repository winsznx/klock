'use client'

import { useUnifiedContract } from '@winsznx/react'

export function PulseDashboard(): React.ReactNode {
  const {
    activeContract,
    contractInfo,
    dailyCheckin,
    isConnected,
    userProfile,
  } = useUnifiedContract()

  return (
    <section aria-labelledby="pulse-dashboard-heading" style={{ display: 'grid', gap: 16, padding: 24, border: '1px solid #ddd', borderRadius: 16 }}>
      <h2 id="pulse-dashboard-heading" style={{ margin: 0, fontSize: 18 }}>Pulse dashboard</h2>
      <div>
        <strong>Connected:</strong> {isConnected ? 'yes' : 'no'}
      </div>
      <div>
        <strong>Active contract:</strong> {activeContract}
      </div>
      <div>
        <strong>Network:</strong> {contractInfo.network}
      </div>
      <div>
        <strong>Contract:</strong> {contractInfo.contractAddress || 'No supported session'}
      </div>
      <button type="button" disabled={!isConnected} aria-label="Trigger daily check-in" onClick={() => void dailyCheckin()}>
        Trigger daily check-in
      </button>
      <pre aria-live="polite">{JSON.stringify(userProfile ?? { message: 'Connect a supported wallet session to load a profile.' }, null, 2)}</pre>
    </section>
  )
}
