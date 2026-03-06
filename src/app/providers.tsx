'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Player } from '@/components/ui/player'
import { WaveBackground } from '@/components/ui/wave-background'
import { AppHeader } from '@/components/ui/app-header'
import { TabBar } from '@/components/ui/tab-bar'
import { HeaderProvider } from '@/lib/header-context'

const AUTH_PREFIXES = ['/login', '/setup', '/onboarding', '/auth', '/invite']
const TAB_ROUTES = ['/home', '/tracks', '/albums', '/profile']
const getTabIdx = (p: string) => TAB_ROUTES.findIndex(t => p.startsWith(t))

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = AUTH_PREFIXES.some(p => pathname.startsWith(p))
  const prevPathRef = useRef(pathname)

  // Compute slide direction synchronously before render
  const prevIdx = getTabIdx(prevPathRef.current)
  const nextIdx = getTabIdx(pathname)
  let anim = 'pageIn .18s ease both'
  if (prevIdx >= 0 && nextIdx >= 0 && prevIdx !== nextIdx) {
    anim = nextIdx > prevIdx
      ? 'slideLeft .26s cubic-bezier(0.25,0.46,0.45,0.94) both'
      : 'slideRight .26s cubic-bezier(0.25,0.46,0.45,0.94) both'
  }

  useEffect(() => {
    prevPathRef.current = pathname
  }, [pathname])

  return (
    <>
      {!isAuthPage && <WaveBackground />}
      <AppHeader />
      <div key={pathname} style={{ animation: anim }}>
        {children}
      </div>
      <Player />
      <TabBar />
      <style>{`
        @keyframes pageIn { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:none } }
        @keyframes slideLeft { from { opacity:0; transform:translateX(24px) } to { opacity:1; transform:none } }
        @keyframes slideRight { from { opacity:0; transform:translateX(-24px) } to { opacity:1; transform:none } }
      `}</style>
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
