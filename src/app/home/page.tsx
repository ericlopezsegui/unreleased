'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { WaveBackground } from '@/components/ui/wave-background'
import { QRCodeSVG } from 'qrcode.react'

interface Profile  { display_name: string | null; avatar_path: string | null }
interface Artist   { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; artist_name: string; updated_at: string; cover_path: string | null }

// ── Icons ─────────────────────────────────────────────────
const P: Record<string, string[]> = {
  music:    ['M9 18V5l12-2v13','M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z','M18 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'],
  albums:   ['M3 3h18v18H3z','M3 9h18','M9 9v12'],
  tracks:   ['M9 18V5l12-2v13','M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z','M18 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'],
  upload:   ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  plus:     ['M12 5v14','M5 12h14'],
  users:    ['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2','M23 21v-2a4 4 0 0 0-3-3.87','M16 3.13a4 4 0 0 1 0 7.75','M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'],
  link:     ['M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71','M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'],
  settings: ['M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z','M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z'],
  close:    ['M18 6L6 18','M6 6l12 12'],
  chevron:  ['M9 18l6-6-6-6'],
  logout:   ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:       ['M3 3h6v6H3z','M15 3h6v6h-6z','M3 15h6v6H3z','M15 15h2v2h-2z','M19 15v2','M15 19h2','M19 19v2'],
  edit:     ['M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7','M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z'],
}

function Icon({ n, size = 18, color = 'currentColor', sw = 1.8 }: { n: string; size?: number; color?: string; sw?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {(P[n] ?? []).map((d, i) => <path key={i} d={d} />)}
    </svg>
  )
}

function TimeAgo({ date }: { date: string }) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return <>ahora</>
  if (s < 3600) return <>{Math.floor(s / 60)}m</>
  if (s < 86400) return <>{Math.floor(s / 3600)}h</>
  return <>{Math.floor(s / 86400)}d</>
}

function QRModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fafafa', padding: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, width: '100%', maxWidth: 280 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#0f0f0f' }}>Abrir en móvil</p>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', display: 'flex' }}><Icon n="close" size={15} /></button>
        </div>
        <QRCodeSVG value={url} size={160} fgColor="#0f0f0f" bgColor="#fafafa" level="M" />
        <p style={{ fontSize: 11, color: '#bbb', textAlign: 'center', lineHeight: 1.6 }}>Escanea para abrir unreleased en tu dispositivo</p>
        <p style={{ fontSize: 10, color: '#ddd', wordBreak: 'break-all', textAlign: 'center' }}>{url}</p>
      </div>
    </div>
  )
}

// ── Action menu ───────────────────────────────────────────
const ACTIONS = [
  { key: 'upload',  label: 'Subir música',    icon: 'upload'   },
  { key: 'album',   label: 'Crear álbum',      icon: 'albums'   },
  { key: 'share',   label: 'Compartir enlace', icon: 'link'     },
  { key: 'members', label: 'Gestionar equipo', icon: 'users'    },
  { key: 'edit',    label: 'Editar artista',   icon: 'edit'     },
  { key: 'settings',label: 'Ajustes',          icon: 'settings' },
]

function ActionMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {open && <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 50 }} />}
      <div style={{
        position: 'absolute', bottom: 56, right: 0,
        display: 'flex', flexDirection: 'column', gap: 6,
        pointerEvents: open ? 'all' : 'none',
        zIndex: 60,
      }}>
        {ACTIONS.map((a, i) => (
          <div key={a.key} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 16px',
            background: 'rgba(250,250,250,0.97)',
            backdropFilter: 'blur(12px)',
            border: '1px solid #f0f0f0',
            cursor: 'pointer', whiteSpace: 'nowrap',
            opacity: open ? 1 : 0,
            transform: open ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.96)',
            transition: `opacity 0.22s ease ${i * 0.04}s, transform 0.22s ease ${i * 0.04}s`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f8f8f8')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(250,250,250,0.97)')}
            onClick={onClose}
          >
            <Icon n={a.icon} size={15} color="#888" />
            <span style={{ fontSize: 13, fontWeight: 500, color: '#0f0f0f', fontFamily: 'Outfit, sans-serif' }}>{a.label}</span>
          </div>
        ))}
      </div>
    </>
  )
}

// ── Page ──────────────────────────────────────────────────
export default function HomePage() {
  const [loading,      setLoading]      = useState(true)
  const [profile,      setProfile]      = useState<Profile | null>(null)
  const [artist,       setArtist]       = useState<Artist | null>(null)
  const [recent,       setRecent]       = useState<RecentItem[]>([])
  const [showQR,       setShowQR]       = useState(false)
  const [menuOpen,     setMenuOpen]     = useState(false)
  const [scrolled,     setScrolled]     = useState(false)
  const [navHeight,    setNavHeight]    = useState(64)
  const scrollRef = useRef<HTMLDivElement>(null)
  const navRef    = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [pRes, aRes] = await Promise.all([
        supabase.from('profiles').select('display_name,avatar_path').eq('user_id', user.id).single(),
        supabase.from('artists').select('id,name,handle,avatar_path,bio').eq('owner_user_id', user.id).order('created_at').limit(1).single(),
      ])
      setProfile(pRes.data)
      const a = aRes.data as Artist | null
      setArtist(a)

      // Resolver URLs de avatares
      if (a?.avatar_path) {
        const { data: signedData } = await supabase.storage
          .from('avatars')
          .createSignedUrl(a.avatar_path, 3600)
        setAvatarUrl(signedData?.signedUrl ?? null)
      }

      if (pRes.data?.avatar_path) {
        const { data: signedData } = await supabase.storage
          .from('avatars')
          .createSignedUrl(pRes.data.avatar_path, 3600)
        setProfileAvatarUrl(signedData?.signedUrl ?? null)
      }

      if (a) {
        const [albRes, trRes] = await Promise.all([
          supabase.from('albums').select('id,title,cover_path,updated_at,artists(name)').eq('artist_id', a.id).order('updated_at', { ascending: false }).limit(6),
          supabase.from('tracks').select('id,title,updated_at,artists(name)').eq('artist_id', a.id).order('updated_at', { ascending: false }).limit(6),
        ])
        const items: RecentItem[] = [
          ...(albRes.data ?? []).map((x: any) => ({ id: x.id, title: x.title, type: 'album' as const, artist_name: x.artists?.name ?? '', updated_at: x.updated_at, cover_path: x.cover_path })),
          ...(trRes.data  ?? []).map((x: any) => ({ id: x.id, title: x.title, type: 'track' as const, artist_name: x.artists?.name ?? '', updated_at: x.updated_at, cover_path: null })),
        ].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 8)
        setRecent(items)
      }
      setLoading(false)
    })()
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => setScrolled(el.scrollTop > 80)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [loading])

  useEffect(() => {
    if (!navRef.current) return
    const observer = new ResizeObserver(entries => {
      setNavHeight(entries[0].contentRect.height)
    })
    observer.observe(navRef.current)
    return () => observer.disconnect()
  }, [])

  const signOut = async () => { await supabase.auth.signOut(); router.push('/login') }
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (typeof window !== 'undefined' ? window.location.origin : '')

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 20, height: 20, border: '2px solid #eee', borderTopColor: '#0f0f0f', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ position: 'relative', height: '100dvh', background: '#fafafa', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <WaveBackground />
      {showQR && <QRModal url={appUrl} onClose={() => setShowQR(false)} />}

      {/* ── Fixed top bar ───────────────────────────────── */}
      <header style={{
        position: 'relative', zIndex: 40, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: 56,
        background: '#0f0f0f',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        {/* Logo / Avatar small */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
            background: '#2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: scrolled ? 1 : 0,
            transform: scrolled ? 'scale(1)' : 'scale(0.6)',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
          }}>
            {avatarUrl ? <img src={avatarUrl} alt={artist?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icon n="music" size={14} color="#666" />}
          </div>
          <span style={{
            fontSize: '0.8rem', fontWeight: 300, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: '#fff',
            opacity: scrolled ? 0 : 1,
            transition: 'opacity 0.3s ease',
            position: scrolled ? 'absolute' : 'relative',
          }}>
            unreleased
          </span>
          {scrolled && (
            <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{artist?.name}</span>
          )}
        </div>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setShowQR(true)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', cursor: 'pointer', borderRadius: 0, color: 'rgba(255,255,255,0.45)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)' }}>
            <Icon n="qr" size={14} />
          </button>
          <button onClick={signOut}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', cursor: 'pointer', borderRadius: 0, color: 'rgba(255,255,255,0.45)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)' }}>
            <Icon n="logout" size={14} />
          </button>
        </div>
      </header>

      {/* ── Scrollable content ──────────────────────────── */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch', position: 'relative', zIndex: 10 }}>

        {/* Hero banner */}
        <div style={{ position: 'relative', width: '100%', paddingTop: '38%', minHeight: 200, background: '#f0f0f0', overflow: 'hidden', flexShrink: 0 }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={artist?.name}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.88)' }} />
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f5f5f5, #e8e8e8)' }}>
              <Icon n="music" size={48} color="#ddd" />
            </div>
          )}
          {/* Gradient overlay bottom */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to top, rgba(250,250,250,1) 0%, rgba(250,250,250,0.4) 60%, transparent 100%)' }} />

          {/* Artist info over banner */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 20px 20px' }}>
            <h1 style={{ fontSize: 'clamp(1.6rem, 5vw, 2.8rem)', fontWeight: 200, letterSpacing: '-0.02em', color: '#0f0f0f', lineHeight: 1.1 }}>
              {artist?.name ?? profile?.display_name}
            </h1>
            {artist?.handle && (
              <p style={{ fontSize: 13, color: '#999', marginTop: 4 }}>@{artist.handle}</p>
            )}
            {artist?.bio && (
              <p style={{ fontSize: 13, color: '#888', marginTop: 6, maxWidth: 480, lineHeight: 1.5 }}>{artist.bio}</p>
            )}
          </div>
        </div>

        {/* Content below hero */}
        <div style={{ padding: '28px 20px 100px', maxWidth: 800, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

          {/* Recent */}
          <section style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#ccc', marginBottom: 16 }}>
              Actividad reciente
            </h2>

            {recent.length === 0 ? (
              <div style={{ padding: '48px 20px', border: '1.5px dashed #eee', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
                <Icon n="music" size={28} color="#e0e0e0" />
                <p style={{ fontSize: 14, color: '#ccc' }}>Aún no hay música</p>
                <p style={{ fontSize: 12, color: '#ddd' }}>Sube tu primer track usando el botón +</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {recent.map((item, i) => (
                  <div key={item.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i < recent.length - 1 ? '1px solid #f5f5f5' : 'none', cursor: 'pointer', transition: 'opacity 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: 6, background: '#f2f2f2', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {item.cover_path
                        ? <img src={item.cover_path} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={item.title} />
                        : <Icon n={item.type === 'album' ? 'albums' : 'tracks'} size={16} color="#ccc" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#0f0f0f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                      <p style={{ fontSize: 12, color: '#bbb', marginTop: 2 }}><TimeAgo date={item.updated_at} /></p>
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#d5d5d5', flexShrink: 0 }}>
                      {item.type === 'album' ? 'álbum' : 'track'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>

      {/* ── FAB action button ───────────────────────────── */}
      <div style={{
        position: 'fixed',
        bottom: navHeight + 16,
        right: 24,
        zIndex: 80,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
      }}>
        <ActionMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            width: 48, height: 48,
            background: '#0f0f0f',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
            transition: 'transform 0.25s ease, background 0.2s ease',
            transform: menuOpen ? 'rotate(45deg)' : 'rotate(0deg)',
            borderRadius: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#333')}
          onMouseLeave={e => (e.currentTarget.style.background = '#0f0f0f')}
        >
          <Icon n="plus" size={20} color="white" sw={2} />
        </button>
      </div>

      {/* ── Bottom nav ──────────────────────────────────── */}
      <nav ref={navRef} style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: 30, display: 'flex',
        background: '#0f0f0f',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}>
        {(
          [
            { key: 'home',   label: 'Inicio',  icon: 'music'   },
            { key: 'albums', label: 'Álbumes', icon: 'albums'  },
            { key: 'tracks', label: 'Tracks',  icon: 'tracks'  },
            { key: 'shares', label: 'Links',   icon: 'link'    },
          ]
        ).map(item => (
          <button key={item.key}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 4px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', color: 'rgba(255,255,255,0.35)', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
          >
            <Icon n={item.icon} size={20} color="currentColor" />
            <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.05em' }}>{item.label}</span>
          </button>
        ))}
      </nav>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
    </div>
  )
}
