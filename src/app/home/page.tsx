'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { WaveBackground } from '@/components/ui/wave-background'
import { QRCodeSVG } from 'qrcode.react'

interface Profile { display_name: string | null; avatar_path: string | null }
interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null }
interface RecentItem { id: string; title: string; type: 'album' | 'track'; updated_at: string; cover_path: string | null }
interface Member { user_id: string; role: string; profiles: { display_name: string | null } | null }
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

function TeamModal({ artist, onClose }: { artist: Artist; onClose: () => void }) {
  const supabase = createClient()
  const [members, setMembers] = useState<Member[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [creating, setCreating] = useState<'editor' | 'viewer' | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [inviteError, setInviteError] = useState<string | null>(null)

  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  useEffect(() => { load() }, [])

  const load = async () => {
    const [mRes, iRes] = await Promise.all([
      supabase.from('artist_members').select('user_id, role').eq('artist_id', artist.id),
      supabase.rpc('get_artist_invites', { p_artist_id: artist.id }),
    ])

    const memberData = (mRes.data ?? []) as { user_id: string; role: string }[]
    const userIds = memberData.map(m => m.user_id)
    const { data: profileData } = userIds.length > 0
      ? await supabase.from('profiles').select('user_id, display_name').in('user_id', userIds)
      : { data: [] }

    const profileMap = Object.fromEntries((profileData ?? []).map(p => [p.user_id, p.display_name]))
    const membersWithNames: Member[] = memberData.map(m => ({
      ...m,
      profiles: { display_name: profileMap[m.user_id] ?? null }
    }))

    setMembers(membersWithNames)
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

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0' }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 560, background: '#fafafa', borderTop: '1px solid #eee', padding: '28px 24px 48px', maxHeight: '85dvh', overflowY: 'auto', fontFamily: 'Outfit, sans-serif' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#ccc', margin: '0 0 4px' }}>Equipo</p>
            <h2 style={{ fontSize: 18, fontWeight: 200, color: '#0f0f0f', margin: 0, letterSpacing: '-0.02em' }}>{artist.name}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', display: 'flex', padding: 4 }}>
            <Ic n="close" s={16} />
          </button>
        </div>

        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#ccc', margin: '0 0 12px' }}>Miembros</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {members.map(m => (
              <div key={m.user_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Ic n="users" s={14} c="#ccc" />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#0f0f0f' }}>{m.profiles?.display_name ?? 'Usuario'}</span>
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: m.role === 'owner' ? '#0f0f0f' : '#bbb' }}>{m.role}</span>
              </div>
            ))}
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
  const [profile, setProfile] = useState<Profile | null>(null)
  const [artist, setArtist] = useState<Artist | null>(null)
  const [recent, setRecent] = useState<RecentItem[]>([])
  const [showQR, setShowQR] = useState(false)
  const [showTeam, setShowTeam] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null)
  const [albumCount, setAlbumCount] = useState(0)
  const [trackCount, setTrackCount] = useState(0)
  const router = useRouter()
  const supabase = createClient()

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
          supabase.from('tracks').select('id,title,updated_at').eq('artist_id', a.id).order('updated_at', { ascending: false }).limit(8),
        ])
        setAlbumCount(albRes.data?.length ?? 0)
        setTrackCount(trRes.data?.length ?? 0)
        const items: RecentItem[] = [
          ...(albRes.data ?? []).map((x: any) => ({ id: x.id, title: x.title, type: 'album' as const, updated_at: x.updated_at, cover_path: x.cover_path })),
          ...(trRes.data ?? []).map((x: any) => ({ id: x.id, title: x.title, type: 'track' as const, updated_at: x.updated_at, cover_path: null })),
        ].sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at)).slice(0, 6)
        setRecent(items)
      }
      setLoading(false)
    })()
  }, [])

  const signOut = async () => { await supabase.auth.signOut(); router.push('/login') }

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
      {showTeam && artist && <TeamModal artist={artist} onClose={() => setShowTeam(false)} />}
      <WaveBackground />
      <div className="top-bar">
        <span className="logo">unreleased</span>
        <div className="top-actions">
          <button className="ghost-btn" onClick={() => setShowQR(true)}><Ic n="qr" s={15} /></button>
          <button className="ghost-btn" onClick={() => {}}><Ic n="set" s={15} /></button>
          <button className="ghost-btn" onClick={signOut}><Ic n="logout" s={15} /></button>
        </div>
      </div>
      <section className="hero">
        {avatarUrl && (
          <div className="hero-img-wrap">
            <img src={avatarUrl} alt="" className="hero-img" />
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
      <section className="actions-section">
        <p className="label-xs">Crear</p>
        <div className="actions-row">
          {([
            { n: 'upload', l: 'Subir track' },
            { n: 'disc',   l: 'Nuevo álbum' },
            { n: 'users',  l: 'Equipo', action: () => setShowTeam(true) },
          ] as const).map(a => (
            <button key={a.n} className="action-pill" onClick={'action' in a ? a.action : undefined}>
              <Ic n={a.n} s={14} c="#999" />
              <span>{a.l}</span>
            </button>
          ))}
        </div>
      </section>
      <section className="recent-section">
        <p className="label-xs">Reciente</p>
        {recent.length === 0 ? (
          <div className="empty">
            <Ic n="music" s={22} c="#e0e0e0" />
            <p>Nada por aquí todavía</p>
            <span>Sube tu primer track para empezar</span>
          </div>
        ) : (
          <div className="recent-list">
            {recent.map((item) => (
              <button key={item.id} className="recent-item">
                <div className={`ri-thumb ${item.type === 'track' ? 'round' : ''}`}>
                  {item.cover_path
                    ? <img src={item.cover_path} alt="" />
                    : <Ic n={item.type === 'album' ? 'disc' : 'music'} s={14} c="#d5d5d5" />}
                </div>
                <div className="ri-info">
                  <span className="ri-title">{item.title}</span>
                  <span className="ri-meta">{item.type === 'album' ? 'Álbum' : 'Track'} · <TimeAgo date={item.updated_at} /></span>
                </div>
                <Ic n="arrow" s={13} c="#ddd" />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

const styles = `
  @keyframes spin { to { transform: rotate(360deg) } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { margin: 0; background: #fafafa; }
  ::selection { background: rgba(15,15,15,0.06); }
  .page { position: relative; min-height: 100dvh; font-family: 'Outfit', -apple-system, system-ui, sans-serif; background: transparent; overflow-x: hidden; }
  .top-bar { position: sticky; top: 0; z-index: 30; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; height: 48px; background: rgba(250,250,250,0.6); backdrop-filter: blur(24px) saturate(180%); -webkit-backdrop-filter: blur(24px) saturate(180%); }
  .logo { font-size: 12px; font-weight: 300; letter-spacing: 0.28em; text-transform: uppercase; color: #0f0f0f; }
  .top-actions { display: flex; gap: 2px; }
  .ghost-btn { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: none; border: none; cursor: pointer; color: #bbb; border-radius: 0; transition: color .15s; }
  .ghost-btn:hover { color: #0f0f0f; }
  .hero { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; padding: 28px 24px 28px; text-align: center; animation: fadeUp .5s ease both; }
  .hero-img-wrap { position: relative; width: 180px; height: 180px; margin-bottom: 28px; flex-shrink: 0; }
  .hero-img { width: 100%; height: 100%; object-fit: cover; opacity: 1; display: block; }
  .greet { font-size: 12px; color: #bbb; font-weight: 400; letter-spacing: 0.03em; margin-bottom: 6px; }
  .artist-name { font-size: clamp(26px, 6vw, 36px); font-weight: 200; letter-spacing: -0.03em; color: #0f0f0f; line-height: 1.1; margin-bottom: 4px; }
  .handle { font-size: 12px; color: #ccc; margin-bottom: 8px; }
  .bio { font-size: 13px; color: #aaa; line-height: 1.55; max-width: 380px; margin-bottom: 0; }
  .stats { display: flex; align-items: center; gap: 16px; margin-top: 20px; }
  .stat { display: flex; align-items: baseline; gap: 5px; }
  .stat-n { font-size: 20px; font-weight: 200; color: #0f0f0f; line-height: 1; }
  .stat-l { font-size: 10px; font-weight: 500; letter-spacing: 0.06em; color: #ccc; text-transform: lowercase; }
  .stat-sep { width: 1px; height: 16px; background: #eee; }
  .actions-section { position: relative; z-index: 1; max-width: 560px; margin: 0 auto; padding: 0 24px 24px; animation: fadeUp .5s ease .08s both; }
  .label-xs { font-size: 10px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: #ccc; margin-bottom: 10px; }
  .actions-row { display: flex; flex-wrap: wrap; gap: 6px; }
  .action-pill { display: inline-flex; align-items: center; gap: 7px; padding: 9px 16px 9px 12px; background: rgba(255,255,255,0.55); backdrop-filter: blur(12px); border: 1px solid rgba(0,0,0,0.05); cursor: pointer; font-family: inherit; font-size: 12px; font-weight: 500; color: #666; transition: all .15s; border-radius: 0; }
  .action-pill:hover { border-color: rgba(0,0,0,0.1); color: #0f0f0f; background: rgba(255,255,255,0.8); }
  .recent-section { position: relative; z-index: 1; max-width: 560px; margin: 0 auto; padding: 0 24px 60px; animation: fadeUp .5s ease .14s both; }
  .empty { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 40px 20px; text-align: center; }
  .empty p { font-size: 13px; color: #bbb; }
  .empty span { font-size: 11px; color: #ddd; }
  .recent-list { display: flex; flex-direction: column; }
  .recent-item { display: flex; align-items: center; gap: 14px; padding: 12px 0; border: none; border-bottom: 1px solid rgba(0,0,0,0.03); background: none; cursor: pointer; width: 100%; font-family: inherit; text-align: left; transition: opacity .12s; }
  .recent-item:last-child { border-bottom: none; }
  .recent-item:hover { opacity: 0.55; }
  .ri-thumb { width: 38px; height: 38px; flex-shrink: 0; background: #f5f5f5; overflow: hidden; display: flex; align-items: center; justify-content: center; border-radius: 3px; }
  .ri-thumb.round { border-radius: 50%; }
  .ri-thumb img { width: 100%; height: 100%; object-fit: cover; }
  .ri-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
  .ri-title { font-size: 13px; font-weight: 500; color: #0f0f0f; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ri-meta { font-size: 11px; color: #ccc; }
  .loader-wrap { min-height: 100dvh; background: #fafafa; display: flex; align-items: center; justify-content: center; }
  .loader { width: 16px; height: 16px; border: 1.5px solid #eee; border-top-color: #0f0f0f; border-radius: 50%; animation: spin .7s linear infinite; }
  .qr-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(250,250,250,0.6); backdrop-filter: blur(16px); display: flex; align-items: center; justify-content: center; padding: 24px; }
  .qr-box { background: #fff; padding: 36px; display: flex; flex-direction: column; align-items: center; gap: 24px; width: 100%; max-width: 280px; box-shadow: 0 12px 48px rgba(0,0,0,0.08); }
`
