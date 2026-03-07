'use client'

import { useUnifiedContract } from '@pulseprotocol/react'

export function PulseDashboard() {
  const {
    activeContract,
    contractInfo,
    dailyCheckin,
    isConnected,
    userProfile,
  } = useUnifiedContract()

  return (
    <section style={{ display: 'grid', gap: 16, padding: 24, border: '1px solid #ddd', borderRadius: 16 }}>
      <div>
        <strong>Active contract:</strong> {activeContract}
      </div>
      <div>
        <strong>Network:</strong> {contractInfo.network}
      </div>
      <div>
        <strong>Contract:</strong> {contractInfo.contractAddress || 'No supported session'}
      </div>
      <button disabled={!isConnected} onClick={() => void dailyCheckin()}>
        Trigger daily check-in
      </button>
      <pre>{JSON.stringify(userProfile, null, 2)}</pre>
    </section>
  )
}
