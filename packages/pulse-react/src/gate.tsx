'use client'

import type { ReactNode } from 'react'
import { useUnifiedPulseContract } from './unified.js'

interface PulseAccessGateProps {
    children: ReactNode
    fallback?: ReactNode
}

export function PulseAccessGate({ children, fallback = null }: PulseAccessGateProps) {
    const { isConnected } = useUnifiedPulseContract()

    if (isConnected) {
        return <>{children}</>
    }

    return <>{fallback}</>
}
