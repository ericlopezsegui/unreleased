'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Player } from '@/components/ui/player'
import { WaveBackground } from '@/components/ui/wave-background'
import { AppHeader } from '@/components/ui/app-header'
import { TabBar } from '@/components/ui/tab-bar'
import { HeaderProvider } from '@/lib/header-context'
import { usePrefetchStore } from '@/stores/prefetch-store'
import { useThemeStore } from '@/stores/theme-store'

const AUTH_PREFIXES = ['/login', '/setup', '/onboarding', '/auth', '/invite']
const TAB_ROUTES = ['/home', '/tracks', '/albums', '/profile']
const getTabIdx = (p: string) => TAB_ROUTES.findIndex(t => p.startsWith(t))

/* ─── Splash screen shown while data is loading ─── */
function Splash({ visible }: { visible: boolean }) {
  const [gone, setGone] = useState(false)
  const themeValue = useThemeStore(s => s.theme)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    if (themeValue === 'dark') { setIsDark(true); return }
    if (themeValue === 'light') { setIsDark(false); return }
    setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches)
  }, [themeValue])

  useEffect(() => {
    if (!visible) { const t = setTimeout(() => setGone(true), 420); return () => clearTimeout(t) }
  }, [visible])
  if (gone) return null

  const bg = isDark ? '#0f0f0f' : '#fafafa'
  const fg = isDark ? '#fff' : '#0f0f0f'
  const dot = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(15,15,15,0.25)'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: bg,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20,
      opacity: visible ? 1 : 0,
      transition: 'opacity .38s ease',
      pointerEvents: visible ? 'all' : 'none',
      fontFamily: 'Outfit, sans-serif',
    }}>
      <h1 style={{ fontSize: 28, fontWeight: 200, color: fg, letterSpacing: '-0.04em', margin: 0, animation: 'splashIn .6s ease both' }}>unreleased</h1>
      <div style={{ display: 'flex', gap: 5, animation: 'splashIn .6s .2s ease both' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 4, height: 4, borderRadius: '50%', background: dot,
            animation: `splashDot .9s ${i * 0.18}s ease infinite`,
          }} />
        ))}
      </div>
      <style>{`
        @keyframes splashIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:none } }
        @keyframes splashDot { 0%,80%,100% { opacity:0.3; transform:scale(1) } 40% { opacity:1; transform:scale(1.4) } }
      `}</style>
    </div>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = AUTH_PREFIXES.some(p => pathname.startsWith(p))
  const prevPathRef = useRef(pathname)
  const ready = usePrefetchStore(s => s.ready)
  const prefetch = usePrefetchStore(s => s.prefetch)

  // Trigger prefetch on mount and after invalidation (for non-auth pages)
  const prefetching = useRef(false)
  useEffect(() => {
    if (!isAuthPage && !ready && !prefetching.current) {
      prefetching.current = true
      prefetch().finally(() => { prefetching.current = false })
    }
  }, [isAuthPage, ready, prefetch])

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

  // Show splash only on non-auth pages while data hasn't loaded
  const showSplash = !isAuthPage && !ready

  return (
    <>
      <Splash visible={showSplash} />
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
