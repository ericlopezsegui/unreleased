'use client'

import { useState } from 'react'
import { usePrefetchStore } from '@/stores/prefetch-store'
import Onboarding from '@/components/onboarding/onboarding'
import MainLayout from '@/components/layout/main-layout'

export default function HomeClientWrapper() {
  const ready = usePrefetchStore(s => s.ready)
  const profile = usePrefetchStore(s => s.profile)
  const [dismissed, setDismissed] = useState(false)

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!dismissed && !profile?.onboarding_completed) {
    return <Onboarding onComplete={() => setDismissed(true)} />
  }

  return <MainLayout />
}
