'use client'

import { usePathname } from 'next/navigation'
import { Player } from '@/components/ui/player'
import { WaveBackground } from '@/components/ui/wave-background'
import { AppHeader } from '@/components/ui/app-header'
import { TabBar } from '@/components/ui/tab-bar'
import { HeaderProvider } from '@/lib/header-context'

const AUTH_PREFIXES = ['/login', '/setup', '/onboarding', '/auth', '/invite']

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = AUTH_PREFIXES.some(p => pathname.startsWith(p))

  return (
    <>
      {/* Wave background lives here — never unmounts between app-page navigations */}
      {!isAuthPage && <WaveBackground />}
      {/* Persistent header — reads title/backHref/rightActions/miniInfo from context */}
      <AppHeader />
      {/* Keyed wrapper gives a gentle fade when the route changes */}
      <div key={pathname} style={{ animation: 'pageIn .18s ease both' }}>
        {children}
      </div>
      <Player />
      {/* Bottom tab bar — persistent, hidden on auth pages */}
      <TabBar />
      <style>{`@keyframes pageIn { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:none } }`}</style>
    </>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <HeaderProvider>
      <Shell>{children}</Shell>
    </HeaderProvider>
  )
}
