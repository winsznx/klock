'use client'

import { useUnifiedContract } from '@winsznx/react'

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
      <button disabled={!isConnected} onClick={() => void dailyCheckin()}>
        Trigger daily check-in
      </button>
      <pre>{JSON.stringify(userProfile ?? { message: 'Connect a supported wallet session to load a profile.' }, null, 2)}</pre>
    </section>
  )
}
