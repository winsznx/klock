'use client'

import type { ReactNode } from 'react'
import { usePulseAuth } from './auth.js'
import { usePulseStacks } from './stacks.js'

interface PulseAccessGateProps {
    children: ReactNode
    fallback?: ReactNode
}

export function PulseAccessGate({ children, fallback = null }: PulseAccessGateProps) {
    const { isLoggedIn } = usePulseAuth()
    const { isConnected } = usePulseStacks()

    if (isLoggedIn || isConnected) {
        return <>{children}</>
    }

    return <>{fallback}</>
}

