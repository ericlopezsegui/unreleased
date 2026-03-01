'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useHeaderContext } from '@/lib/header-context'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null; album_id: string | null; album_title: string | null }
interface Member { user_id: string; role: string; display_name: string | null; avatar_url: string | null }
interface Invite { id: string; token: string; role: string; expires_at: string; used_at: string | null }

const ico: Record<string, [string, ...string[]]> = {
  music:  ['M9 18V5l12-2v13','M6 21a3 3 0 100-6 3 3 3 0 000 6z','M18 19a3 3 0 100-6 3 3 3 0 000 6z'],
  disc:   ['M12 2a10 10 0 100 20 10 10 0 000-20z','M12 8a4 4 0 100 8 4 4 0 000-8z','M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4','M17 8l-5-5-5 5','M12 3v12'],
  link:   ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71','M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users:  ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2','M9 7a4 4 0 100-8 4 4 0 000 8z','M22 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4','M16 17l5-5-5-5','M21 12H9'],
  qr:     ['M3 3h7v7H3z','M14 3h7v7h-7z','M3 14h7v7H3z','M17 14h1v1h-1z','M21 14v3h-2','M14 21h3v-2','M21 21h-1v-1'],
  close:  ['M18 6L6 18','M6 6l12 12'],
  arrow:  ['M5 12h14','M12 5l7 7-7 7'],
  set:    ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z'],
}

function Ic({ n, s = 16, c = 'currentColor', w = 1.4 }: { n: string; s?: number; c?: string; w?: number }) {
  const p = ico[n]
  if (!p) return null
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      {p.map((d, i) => <path key={i} d={d} />)}
    </svg>
  )
}

function TimeAgo({ date }: { date: string }) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (s < 60) return <span>ahora</span>
  if (s < 3600) return <span>{Math.floor(s / 60)}m</span>
  if (s < 86400) return <span>{Math.floor(s / 3600)}h</span>
  if (s < 604800) return <span>{Math.floor(s / 86400)}d</span>
  return <span>{new Date(date).toLocaleDateString('es', { day: 'numeric', month: 'short' })}</span>
}

function QRModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div onClick={onClose} className="qr-overlay">
      <div onClick={e => e.stopPropagation()} className="qr-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <span className="label-xs">Abrir en móvil</span>
          <button onClick={onClose} className="ghost-btn"><Ic n="close" s={13} /></button>
        </div>
        <QRCodeSVG value={url} size={160} fgColor="#0f0f0f" bgColor="#fff" level="M" />
        <p style={{ fontSize: 11, color: '#aaa', textAlign: 'center', margin: 0 }}>Escanea con tu cámara</p>
      </div>
    </div>
  )
}

function TeamModal({ artist, currentUserId, onClose }: { artist: Artist; currentUserId: string; onClose: () => void }) {
  const supabase = createClient()
  const [members, setMembers] = useState<Member[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [creating, setCreating] = useState<'editor' | 'viewer' | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [closing, setClosing] = useState(false)
  const [visible, setVisible] = useState(false)

  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    load()
  }, [])

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => onClose(), 320)
  }

  const load = async () => {
    const [mRes, iRes] = await Promise.all([
      supabase.rpc('get_artist_member_profiles', { aid: artist.id }),
      supabase.rpc('get_artist_invites', { p_artist_id: artist.id }),
    ])

    const memberData = (mRes.data ?? []) as { user_id: string; role: string; created_at: string; display_name: string | null; avatar_path: string | null }[]

    // Generate signed avatar URLs in parallel
    const membersWithData: Member[] = await Promise.all(
      memberData.map(async m => {
        let avatar_url: string | null = null
        if (m.avatar_path) {
          const { data: su } = await supabase.storage.from('avatars').createSignedUrl(m.avatar_path, 3600)
          avatar_url = su?.signedUrl ?? null
        }
        return { user_id: m.user_id, role: m.role, display_name: m.display_name ?? null, avatar_url }
      })
    )

    setMembers(membersWithData)
    setInvites((iRes.data ?? []) as Invite[])
  }

  const createInvite = async (role: 'editor' | 'viewer') => {
    setCreating(role)
    setInviteError(null)

    const { data, error } = await supabase.rpc('create_artist_invite', { p_artist_id: artist.id, p_role: role })

    if (error) {
      setInviteError(`Error: ${error.message}`)
      setCreating(null)
      return
    }

    if (data?.[0]) {
      setInvites(prev => [data[0] as Invite, ...prev])
    }

    setCreating(null)
  }

  const deleteInvite = async (id: string) => {
    await supabase.from('artist_invites').delete().eq('id', id)
    setInvites(prev => prev.filter(i => i.id !== id))
  }

  const removeMember = async (userId: string) => {
    await supabase.from('artist_members').delete().eq('artist_id', artist.id).eq('user_id', userId)
    setMembers(prev => prev.filter(m => m.user_id !== userId))
  }

  const isOwner = members.find(m => m.user_id === currentUserId)?.role === 'owner'

  const copyLink = (token: string) => {
    const text = `${origin}/invite/${token}`
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(token)
        setTimeout(() => setCopied(null), 2000)
      }).catch(() => fallbackCopy(token, text))
    } else {
      fallbackCopy(token, text)
    }
  }

  const fallbackCopy = (token: string, text: string) => {
    const el = document.createElement('textarea')
    el.value = text
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.focus()
    el.select()
    try {
      document.execCommand('copy')
      setCopied(token)
      setTimeout(() => setCopied(null), 2000)
    } catch {}
    document.body.removeChild(el)
  }

  const activeInvites = invites.filter(i => !i.used_at && new Date(i.expires_at) > new Date())

  const overlayStyle: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 100,
    background: visible && !closing ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0)',
    backdropFilter: visible && !closing ? 'blur(8px)' : 'blur(0px)',
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 0,
    transition: 'background .32s ease, backdrop-filter .32s ease',
  }

  const panelStyle: React.CSSProperties = {
    width: '100%', maxWidth: 560, background: '#fafafa',
    borderTop: '1px solid #eee', padding: '28px 24px 48px',
    maxHeight: '85dvh', overflowY: 'auto', fontFamily: 'Outfit, sans-serif',
    transform: visible && !closing ? 'translateY(0)' : 'translateY(100%)',
    opacity: visible && !closing ? 1 : 0,
    transition: 'transform .34s cubic-bezier(0.32, 0.72, 0, 1), opacity .28s ease',
  }

  return (
    <div onClick={handleClose} style={overlayStyle}>
      <div onClick={e => e.stopPropagation()} style={panelStyle}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#ccc', margin: '0 0 4px' }}>Equipo</p>
            <h2 style={{ fontSize: 18, fontWeight: 200, color: '#0f0f0f', margin: 0, letterSpacing: '-0.02em' }}>{artist.name}</h2>
          </div>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', display: 'flex', padding: 4 }}>
            <Ic n="close" s={16} />
          </button>
        </div>

        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#ccc', margin: '0 0 12px' }}>Miembros</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {members.map(m => {
              const initial = (m.display_name ?? '?')[0].toUpperCase()
              return (
                <div key={m.user_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.03)', animation: 'fadeUp .3s ease both' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', fontSize: 12, fontWeight: 600, color: '#999' }}>
                      {m.avatar_url
                        ? <img src={m.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        : initial}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: '#0f0f0f', lineHeight: 1.2 }}>{m.display_name ?? 'Usuario'}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: m.role === 'owner' ? '#888' : '#c0c0c0' }}>{m.role === 'owner' ? 'Propietario' : m.role === 'editor' ? 'Editor' : 'Solo lectura'}</span>
                    </div>
                  </div>
                  {isOwner && m.role !== 'owner' && (
                    <button
                      onClick={() => removeMember(m.user_id)}
                      title="Eliminar miembro"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ddd', display: 'flex', padding: 4, borderRadius: 4, transition: 'color .15s, background .15s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#e53e3e'; e.currentTarget.style.background = 'rgba(229,62,62,0.06)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#ddd'; e.currentTarget.style.background = 'none' }}>
                      <Ic n="close" s={14} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#ccc', margin: '0 0 12px' }}>Invitaciones activas</p>
          {activeInvites.length === 0 ? (
            <p style={{ fontSize: 12, color: '#ddd', padding: '16px 0' }}>No hay invitaciones activas</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activeInvites.map(inv => (
                <div key={inv.id} style={{ padding: '14px 14px', background: '#fff', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: inv.role === 'editor' ? '#0f0f0f' : '#999', padding: '3px 7px', border: '1px solid', borderColor: inv.role === 'editor' ? '#0f0f0f' : '#eee' }}>
                        {inv.role === 'editor' ? 'Editor' : 'Solo lectura'}
                      </span>
                      <span style={{ fontSize: 11, color: '#ccc' }}>· expira {new Date(inv.expires_at).toLocaleDateString('es', { day: 'numeric', month: 'short' })}</span>
                    </div>
                    <button onClick={() => deleteInvite(inv.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ddd', display: 'flex', padding: 2, transition: 'color .15s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#999')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#ddd')}>
                      <Ic n="close" s={13} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: '#fafafa', border: '1px solid #f5f5f5' }}>
                    <span style={{ flex: 1, fontSize: 11, color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace', letterSpacing: '0.01em' }}>
                      {origin}/invite/{inv.token}
                    </span>
                    <button onClick={() => copyLink(inv.token)}
                      style={{ background: copied === inv.token ? '#0f0f0f' : 'none', border: '1px solid', borderColor: copied === inv.token ? '#0f0f0f' : '#eee', cursor: 'pointer', padding: '5px 10px', fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: copied === inv.token ? '#fff' : '#999', fontFamily: 'inherit', transition: 'all .15s', flexShrink: 0, whiteSpace: 'nowrap' }}>
                      {copied === inv.token ? '✓ Copiado' : 'Copiar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#ccc', margin: '0 0 10px' }}>Crear enlace de invitación</p>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => createInvite('editor')} disabled={creating !== null}
              style={{ flex: 1, padding: '11px 16px', background: '#0f0f0f', color: '#fff', border: 'none', cursor: creating !== null ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 500, fontFamily: 'inherit', opacity: creating !== null ? 0.5 : 1, transition: 'opacity .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {creating === 'editor' ? <span style={{ width: 12, height: 12, border: '1.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} /> : null}
              + Editor
            </button>
            <button onClick={() => createInvite('viewer')} disabled={creating !== null}
              style={{ flex: 1, padding: '11px 16px', background: '#fff', color: '#0f0f0f', border: '1px solid #eee', cursor: creating !== null ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 500, fontFamily: 'inherit', opacity: creating !== null ? 0.5 : 1, transition: 'opacity .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {creating === 'viewer' ? <span style={{ width: 12, height: 12, border: '1.5px solid #ccc', borderTopColor: '#0f0f0f', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} /> : null}
              + Solo lectura
            </button>
          </div>
          {inviteError && <p style={{ fontSize: 11, color: '#e05', marginTop: 8 }}>{inviteError}</p>}
          {!inviteError && <p style={{ fontSize: 11, color: '#ccc', marginTop: 8 }}>Los enlaces caducan en 7 días y son de un solo uso.</p>}
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [artist, setArtist] = useState<Artist | null>(null)
  const [recent, setRecent] = useState<RecentItem[]>([])
  const [showQR, setShowQR] = useState(false)
  const [showTeam, setShowTeam] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null)
  const [albumCount, setAlbumCount] = useState(0)
  const [trackCount, setTrackCount] = useState(0)
  const [coverUrls, setCoverUrls] = useState<Record<string, string>>({})
  const [recentView, setRecentView] = useState<'grid' | 'list'>('grid')
  const router = useRouter()
  const supabase = createClient()
  const heroRef = useRef<HTMLElement>(null)
  const { setRightActions, setMiniInfo } = useHeaderContext()

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const pRes = await supabase.from('profiles').select('display_name,avatar_path').eq('user_id', user.id).single()
      setProfile(pRes.data)

      // Buscar artista donde el usuario sea miembro (owner o invitado)
      const { data: membership } = await supabase
        .from('artist_members')
        .select('artist_id')
        .eq('user_id', user.id)
        .order('created_at')
        .limit(1)
        .single()

      let a: Artist | null = null
      if (membership) {
        const { data: artistData } = await supabase
          .from('artists')
          .select('id,name,handle,avatar_path,bio')
          .eq('id', membership.artist_id)
          .single()
        a = artistData as Artist | null
      }

      setArtist(a)

      if (a?.avatar_path) {
        const { data } = await supabase.storage.from('avatars').createSignedUrl(a.avatar_path, 86400)
        if (data?.signedUrl) setAvatarUrl(data.signedUrl)
      }
      if (pRes.data?.avatar_path) {
        const { data } = await supabase.storage.from('avatars').createSignedUrl(pRes.data.avatar_path, 86400)
        if (data?.signedUrl) setProfileAvatarUrl(data.signedUrl)
      }
      if (a) {
        const [albRes, trRes] = await Promise.all([
          supabase.from('albums').select('id,title,cover_path,updated_at').eq('artist_id', a.id).order('updated_at', { ascending: false }).limit(8),
          supabase.from('tracks').select('id,title,updated_at,cover_path,album_id,albums(title,cover_path)').eq('artist_id', a.id).order('updated_at', { ascending: false }).limit(8),
        ])
        setAlbumCount(albRes.data?.length ?? 0)
        setTrackCount(trRes.data?.length ?? 0)
        const items: RecentItem[] = [
          ...(albRes.data ?? []).map((x: any) => ({ id: x.id, title: x.title, type: 'album' as const, updated_at: x.updated_at, cover_path: x.cover_path, album_id: null, album_title: null })),
          ...(trRes.data ?? []).map((x: any) => ({ id: x.id, title: x.title, type: 'track' as const, updated_at: x.updated_at, cover_path: x.cover_path ?? (x.albums as any)?.cover_path ?? null, album_id: x.album_id ?? null, album_title: (x.albums as any)?.title ?? null })),
        ].sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at)).slice(0, 6)
        setRecent(items)
        const coverItems = items.filter(i => i.cover_path)
        if (coverItems.length) {
          const urlEntries = await Promise.all(
            coverItems.map(async (item) => {
              const { data } = await supabase.storage.from('covers').createSignedUrl(item.cover_path!, 86400)
              return [item.id, data?.signedUrl ?? null] as const
            })
          )
          setCoverUrls(Object.fromEntries(urlEntries.filter(([, url]) => url !== null) as [string, string][]))
        }
      }
      setLoading(false)
    })()
  }, [])

  const signOut = async () => { await supabase.auth.signOut(); router.push('/login') }

  // Inject right-action buttons into the persistent header
  useEffect(() => {
    setRightActions(
      <>
        <button className="ghost-btn" onClick={() => setShowQR(true)}><Ic n="qr" s={15} /></button>
        <button className="ghost-btn" onClick={() => {}}><Ic n="set" s={15} /></button>
        <button className="ghost-btn" onClick={signOut}><Ic n="logout" s={15} /></button>
      </>
    )
    return () => { setRightActions(null); setMiniInfo(null) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Collapse hero into header on scroll
  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting && artist) {
        setMiniInfo({ avatarUrl, name: artist.name })
      } else {
        setMiniInfo(null)
      }
    }, { threshold: 0 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [avatarUrl, artist])

  if (loading) return (
    <div className="loader-wrap">
      <div className="loader" />
      <style>{styles}</style>
    </div>
  )

  const hour = new Date().getHours()
  const greet = hour < 6 ? 'Buenas noches' : hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'
  const firstName = profile?.display_name?.split(' ')[0]

  return (
    <div className="page">
      <style>{styles}</style>
      {showQR && <QRModal url={typeof window !== 'undefined' ? window.location.origin : ''} onClose={() => setShowQR(false)} />}
      {showTeam && artist && <TeamModal artist={artist} currentUserId={userId ?? ''} onClose={() => setShowTeam(false)} />}
      {/* ── Hero ── */}
      <section className="hero" ref={heroRef}>
        {avatarUrl && (
          <div className="hero-img-wrap">
            <img src={avatarUrl} alt="" className="hero-img" />
            <div className="hero-img-shadow" style={{ backgroundImage: `url(${avatarUrl})` }} />
          </div>
        )}
        <p className="greet">{greet}{firstName ? `, ${firstName}` : ''}</p>
        <h1 className="artist-name">{artist?.name ?? 'Tu espacio'}</h1>
        {artist?.handle && <p className="handle">@{artist.handle}</p>}
        {artist?.bio && <p className="bio">{artist.bio}</p>}
        <div className="stats">
          <div className="stat">
            <span className="stat-n">{trackCount}</span>
            <span className="stat-l">tracks</span>
          </div>
          <div className="stat-sep" />
          <div className="stat">
            <span className="stat-n">{albumCount}</span>
            <span className="stat-l">álbumes</span>
          </div>
        </div>
      </section>

      {/* ── Quick actions ── */}
      <section className="actions-section">
        <p className="section-label">Acciones</p>
        <div className="actions-row">
          {([
            { n: 'upload', l: 'Subir track',  action: () => router.push(`/tracks/new?artist=${artist?.id ?? ''}`) },
            { n: 'disc',   l: 'Álbumes',      action: () => router.push('/albums') },
            { n: 'music',  l: 'Tracks',       action: () => router.push('/tracks') },
            { n: 'users',  l: 'Equipo',       action: () => setShowTeam(true) },
          ] as const).map(a => (
            <button key={a.n} className="action-pill" onClick={a.action}>
              <span className="action-pill-icon"><Ic n={a.n} s={15} c="currentColor" /></span>
              <span>{a.l}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Recent ── */}
      <section className="recent-section">
        <div className="section-header">
          <p className="section-label">Actividad reciente</p>
          {recent.length > 0 && <span className="section-count">{recent.length}</span>}
          {recent.length > 0 && (
            <div className="view-toggle">
              <button className={`vt-btn${recentView === 'grid' ? ' active' : ''}`} onClick={() => setRecentView('grid')} aria-label="Cuadrícula">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              </button>
              <button className={`vt-btn${recentView === 'list' ? ' active' : ''}`} onClick={() => setRecentView('list')} aria-label="Lista">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><rect x="3" y="4" width="4" height="4" rx="0.5"/><rect x="3" y="10" width="4" height="4" rx="0.5"/><rect x="3" y="16" width="4" height="4" rx="0.5"/></svg>
              </button>
            </div>
          )}
        </div>
        {recent.length === 0 ? (
          <div className="empty">
            <div className="empty-icon"><Ic n="music" s={24} c="#d0d0d0" /></div>
            <p className="empty-title">Nada por aquí todavía</p>
            <p className="empty-sub">Sube tu primer track para empezar</p>
          </div>
        ) : (
          <>
            {recentView === 'grid' ? (
              <div className="recent-grid">
                {recent.map((item, i) => (
                  <button
                    key={item.id}
                    className="rc"
                    style={{ animationDelay: `${i * 0.06}s` }}
                    onClick={() => router.push(item.type === 'album' ? `/albums/${item.id}` : `/tracks/${item.id}`)}
                  >
                    <div className="rc-cover">
                      {coverUrls[item.id]
                        ? <img src={coverUrls[item.id]} alt="" />
                        : (
                          <div className={`rc-cover-placeholder ${item.type}`}>
                            <Ic n={item.type === 'album' ? 'disc' : 'music'} s={18} c="currentColor" />
                          </div>
                        )}
                      <span className={`rc-badge ${item.type}`}>
                        {item.type === 'album' ? 'Álbum' : 'Track'}
                      </span>
                    </div>
                    <div className="rc-body">
                      <span className="rc-title">{item.title}</span>
                      <span className="rc-meta">
                        {item.type === 'track' && item.album_title && (
                          <><span className="rc-album-name">{item.album_title}</span><span className="rc-sep">·</span></>
                        )}
                        {item.type === 'track' && !item.album_id && (
                          <><span className="rc-single">Single</span><span className="rc-sep">·</span></>
                        )}
                        <TimeAgo date={item.updated_at} />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="recent-list">
                {recent.map((item, i) => (
                  <button
                    key={item.id}
                    className="rl"
                    style={{ animationDelay: `${i * 0.04}s` }}
                    onClick={() => router.push(item.type === 'album' ? `/albums/${item.id}` : `/tracks/${item.id}`)}
                  >
                    <div className="rl-cover">
                      {coverUrls[item.id]
                        ? <img src={coverUrls[item.id]} alt="" />
                        : (
                          <div className={`rl-cover-ph ${item.type}`}>
                            <Ic n={item.type === 'album' ? 'disc' : 'music'} s={14} c="currentColor" />
                          </div>
                        )}
                    </div>
                    <div className="rl-info">
                      <span className="rl-title">{item.title}</span>
                      <span className="rl-meta">
                        <span className={`rl-type ${item.type}`}>{item.type === 'album' ? 'Álbum' : 'Track'}</span>
                        {item.type === 'track' && item.album_title && (
                          <><span className="rc-sep">·</span><span className="rc-album-name">{item.album_title}</span></>
                        )}
                        {item.type === 'track' && !item.album_id && (
                          <><span className="rc-sep">·</span><span className="rc-single">Single</span></>
                        )}
                      </span>
                    </div>
                    <span className="rl-time"><TimeAgo date={item.updated_at} /></span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}

const styles = `
  @keyframes spin { to { transform: rotate(360deg) } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
  @keyframes scaleIn { from { opacity:0; transform:scale(0.96) translateY(10px) } to { opacity:1; transform:scale(1) translateY(0) } }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { margin: 0; background: #fafafa; }
  ::selection { background: rgba(15,15,15,0.06); }

  .page { position: relative; min-height: 100dvh; font-family: 'Outfit', -apple-system, system-ui, sans-serif; background: transparent; overflow-x: hidden; padding-top: 52px; padding-bottom: 80px; }



  /* ── Hero ── */
  .hero { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; padding: 36px 24px 32px; text-align: center; animation: fadeUp .6s cubic-bezier(0.16,1,0.3,1) both; }
  .hero-img-wrap { position: relative; width: 140px; height: 140px; margin-bottom: 28px; flex-shrink: 0; }
  .hero-img { width: 100%; height: 100%; object-fit: cover; display: block; position: relative; z-index: 1; }
  .hero-img-shadow { position: absolute; inset: 8px; z-index: 0; filter: blur(28px) saturate(1.6); opacity: 0.3; background-size: cover; background-position: center; }
  .greet { font-size: 12px; color: #b0b0b0; font-weight: 400; letter-spacing: 0.04em; margin-bottom: 8px; }
  .artist-name { font-size: clamp(28px, 7vw, 40px); font-weight: 200; letter-spacing: -0.035em; color: #0f0f0f; line-height: 1.08; margin-bottom: 2px; }
  .handle { font-size: 12px; color: #c0c0c0; margin-bottom: 6px; letter-spacing: 0.01em; }
  .bio { font-size: 13px; color: #a0a0a0; line-height: 1.6; max-width: 360px; margin-bottom: 0; font-weight: 300; }
  .stats { display: flex; align-items: center; gap: 20px; margin-top: 24px; }
  .stat { display: flex; align-items: baseline; gap: 6px; }
  .stat-n { font-size: 22px; font-weight: 200; color: #0f0f0f; line-height: 1; letter-spacing: -0.02em; }
  .stat-l { font-size: 10px; font-weight: 500; letter-spacing: 0.05em; color: #c0c0c0; text-transform: lowercase; }
  .stat-sep { width: 1px; height: 18px; background: #ebebeb; }

  /* ── Section shared ── */
  .section-label { font-size: 10px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: #c0c0c0; margin: 0; }
  .section-header { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
  .section-count { font-size: 10px; font-weight: 500; color: #d0d0d0; background: rgba(0,0,0,0.03); padding: 2px 7px; border-radius: 4px; }

  /* ── Actions ── */
  .actions-section { position: relative; z-index: 1; max-width: 560px; margin: 0 auto; padding: 0 24px 28px; animation: fadeUp .6s cubic-bezier(0.16,1,0.3,1) .06s both; }
  .actions-section .section-label { margin-bottom: 12px; }
  .actions-row { display: flex; flex-wrap: wrap; gap: 8px; }
  .action-pill { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px 10px 12px; background: rgba(255,255,255,0.6); backdrop-filter: blur(12px); border: 1px solid rgba(0,0,0,0.05); cursor: pointer; font-family: inherit; font-size: 12.5px; font-weight: 500; color: #888; transition: all .2s cubic-bezier(0.16,1,0.3,1); border-radius: 0; }
  .action-pill:hover { border-color: rgba(0,0,0,0.1); color: #0f0f0f; background: rgba(255,255,255,0.85); transform: translateY(-1px); box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
  .action-pill-icon { display: flex; align-items: center; justify-content: center; color: #b0b0b0; transition: color .2s; }
  .action-pill:hover .action-pill-icon { color: #0f0f0f; }

  /* ── Recent ── */
  .recent-section { position: relative; z-index: 1; max-width: 560px; margin: 0 auto; padding: 0 24px; animation: fadeUp .6s cubic-bezier(0.16,1,0.3,1) .12s both; }

  .empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 52px 20px; text-align: center; }
  .empty-icon { width: 56px; height: 56px; border-radius: 16px; background: rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.04); display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
  .empty-title { font-size: 14px; color: #b0b0b0; font-weight: 400; }
  .empty-sub { font-size: 12px; color: #d0d0d0; font-weight: 300; }

  .recent-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
  @media (max-width: 400px) { .recent-grid { grid-template-columns: 1fr; } }

  .rc { display: flex; flex-direction: column; background: rgba(255,255,255,0.65); backdrop-filter: blur(8px); border: 1px solid rgba(0,0,0,0.04); border-radius: 6px; overflow: hidden; cursor: pointer; font-family: inherit; text-align: left; transition: all .25s cubic-bezier(0.16,1,0.3,1); animation: scaleIn .5s cubic-bezier(0.16,1,0.3,1) both; }
  .rc:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.06); border-color: rgba(0,0,0,0.07); background: rgba(255,255,255,0.9); }
  .rc:active { transform: translateY(0) scale(0.985); }

  .rc-cover { position: relative; width: 100%; aspect-ratio: 1; overflow: hidden; background: #f3f3f3; }
  .rc-cover img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform .4s cubic-bezier(0.16,1,0.3,1); }
  .rc:hover .rc-cover img { transform: scale(1.04); }
  .rc-cover-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
  .rc-cover-placeholder.album { background: linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%); color: #ccc; }
  .rc-cover-placeholder.track { background: linear-gradient(135deg, #f5f3f0 0%, #ede9e5 100%); color: #c8c0b8; }

  .rc-badge { position: absolute; top: 8px; left: 8px; font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 7px; border-radius: 3px; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
  .rc-badge.album { background: rgba(15,15,15,0.7); color: #fff; }
  .rc-badge.track { background: rgba(255,255,255,0.8); color: #666; border: 1px solid rgba(0,0,0,0.06); }

  .rc-body { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 3px; }
  .rc-title { font-size: 13px; font-weight: 600; color: #0f0f0f; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; letter-spacing: -0.01em; line-height: 1.3; }
  .rc-meta { font-size: 11px; color: #b5b5b5; display: flex; align-items: center; gap: 4px; overflow: hidden; white-space: nowrap; font-weight: 400; }
  .rc-sep { color: #ddd; }
  .rc-album-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #999; }
  .rc-single { color: #c0b8b0; font-style: italic; }

  /* ── View toggle ── */
  .view-toggle { display:flex; gap:2px; margin-left:auto; }
  .vt-btn { display:flex; align-items:center; justify-content:center; width:28px; height:28px; background:none; border:1px solid transparent; border-radius:5px; cursor:pointer; color:#d0d0d0; transition:all .15s; }
  .vt-btn:hover { color:#999; background:rgba(0,0,0,0.02); }
  .vt-btn.active { color:#0f0f0f; background:rgba(0,0,0,0.04); border-color:rgba(0,0,0,0.05); }

  /* ── Recent list view ── */
  .recent-list { display:flex; flex-direction:column; gap:2px; }
  .rl { display:flex; align-items:center; gap:14px; padding:8px 12px; background:rgba(255,255,255,0.5); backdrop-filter:blur(8px); border:1px solid rgba(0,0,0,0.03); border-radius:6px; cursor:pointer; font-family:inherit; text-align:left; transition:all .2s cubic-bezier(0.16,1,0.3,1); animation:fadeUp .35s cubic-bezier(0.16,1,0.3,1) both; }
  .rl:hover { background:rgba(255,255,255,0.85); border-color:rgba(0,0,0,0.06); box-shadow:0 2px 12px rgba(0,0,0,0.03); }
  .rl:active { transform:scale(0.99); }
  .rl-cover { width:44px; height:44px; border-radius:4px; overflow:hidden; flex-shrink:0; background:#f3f3f3; }
  .rl-cover img { width:100%; height:100%; object-fit:cover; display:block; }
  .rl-cover-ph { width:100%; height:100%; display:flex; align-items:center; justify-content:center; }
  .rl-cover-ph.album { background:linear-gradient(135deg,#f0f0f0,#e8e8e8); color:#ccc; }
  .rl-cover-ph.track { background:linear-gradient(135deg,#f5f3f0,#ede9e5); color:#c8c0b8; }
  .rl-info { flex:1; min-width:0; display:flex; flex-direction:column; gap:2px; }
  .rl-title { font-size:13px; font-weight:500; color:#0f0f0f; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; letter-spacing:-0.01em; }
  .rl-meta { font-size:11px; color:#b5b5b5; display:flex; align-items:center; gap:4px; overflow:hidden; white-space:nowrap; }
  .rl-type { font-size:9px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; }
  .rl-type.album { color:#0f0f0f; }
  .rl-type.track { color:#999; }
  .rl-time { font-size:11px; color:#d0d0d0; flex-shrink:0; }

  /* ── Loader ── */
  .loader-wrap { min-height: 100dvh; background: #fafafa; display: flex; align-items: center; justify-content: center; }
  .loader { width: 18px; height: 18px; border: 1.5px solid #eee; border-top-color: #0f0f0f; border-radius: 50%; animation: spin .7s linear infinite; }

  /* ── QR ── */
  .qr-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(250,250,250,0.6); backdrop-filter: blur(20px); display: flex; align-items: center; justify-content: center; padding: 24px; }
  .qr-box { background: #fff; padding: 36px; display: flex; flex-direction: column; align-items: center; gap: 24px; width: 100%; max-width: 280px; box-shadow: 0 16px 64px rgba(0,0,0,0.08); border-radius: 8px; }
`
