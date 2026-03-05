'use client'

import { usePathname, useRouter } from 'next/navigation'

const TABS = [
  {
    key: 'home',
    label: 'Home',
    href: '/home',
    match: (p: string) => p === '/home',
    icon: (a: boolean) => (
      <svg width={22} height={22} viewBox="0 0 24 24" fill={a ? '#0f0f0f' : 'none'} stroke={a ? '#0f0f0f' : 'currentColor'} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z" />
      </svg>
    ),
  },
  {
    key: 'tracks',
    label: 'Tracks',
    href: '/tracks',
    match: (p: string) => p.startsWith('/tracks'),
    icon: (a: boolean) => (
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" fill={a ? '#0f0f0f' : 'none'} stroke={a ? '#0f0f0f' : 'currentColor'} />
        <circle cx="6" cy="18" r="3" fill={a ? '#0f0f0f' : 'none'} stroke={a ? '#0f0f0f' : 'currentColor'} />
        <circle cx="18" cy="16" r="3" fill={a ? '#0f0f0f' : 'none'} stroke={a ? '#0f0f0f' : 'currentColor'} />
      </svg>
    ),
  },
  {
    key: 'albums',
    label: 'Álbumes',
    href: '/albums',
    match: (p: string) => p.startsWith('/albums'),
    icon: (a: boolean) => (
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" fill={a ? '#0f0f0f' : 'none'} stroke={a ? '#0f0f0f' : 'currentColor'} />
        <circle cx="12" cy="12" r="4" fill={a ? '#fafafa' : 'none'} stroke={a ? '#fafafa' : 'currentColor'} />
        <circle cx="12" cy="12" r="1" fill={a ? '#fafafa' : 'currentColor'} stroke="none" />
      </svg>
    ),
  },
  {
    key: 'profile',
    label: 'Perfil',
    href: '/profile',
    match: (p: string) => p.startsWith('/profile'),
    icon: (a: boolean) => (
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={a ? '#0f0f0f' : 'currentColor'} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" fill={a ? '#0f0f0f' : 'none'} />
        <path d="M20 21c0-3.3-3.6-6-8-6s-8 2.7-8 6" fill={a ? '#0f0f0f' : 'none'} />
      </svg>
    ),
  },
] as const

const AUTH_PREFIXES = ['/login', '/setup', '/onboarding', '/auth', '/invite']

export function TabBar() {
  const pathname = usePathname()
  const router = useRouter()

  // Hide on auth pages
  if (AUTH_PREFIXES.some(p => pathname.startsWith(p))) return null

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 60,
      display: 'flex',
      alignItems: 'stretch',
      justifyContent: 'space-around',
      height: 64,
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      background: 'rgba(250,250,250,0.78)',
      backdropFilter: 'blur(28px) saturate(180%)',
      WebkitBackdropFilter: 'blur(28px) saturate(180%)',
      borderTop: '1px solid rgba(0,0,0,0.06)',
      fontFamily: 'Outfit, sans-serif',
    }}>
      {TABS.map(tab => {
        const active = tab.match(pathname)
        return (
          <button
            key={tab.key}
            onClick={() => router.push(tab.href)}
            aria-label={tab.label}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 0',
              color: active ? '#0f0f0f' : '#b0b0b0',
              transition: 'color .2s ease',
              WebkitTapHighlightColor: 'transparent',
              position: 'relative',
            }}
          >
            {/* Active indicator dot */}
            {active && (
              <span style={{
                position: 'absolute',
                top: 4,
                width: 4,
                height: 4,
                borderRadius: '50%',
                background: '#0f0f0f',
              }} />
            )}
            <span style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              transition: 'transform .15s ease',
              transform: active ? 'scale(1)' : 'scale(0.92)',
            }}>
              {tab.icon(active)}
            </span>
            <span style={{
              fontSize: 10,
              fontWeight: active ? 600 : 400,
              letterSpacing: '0.02em',
              lineHeight: 1,
            }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
