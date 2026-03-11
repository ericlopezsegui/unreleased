'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useHeaderContext } from '@/lib/header-context'
import { usePlayerStore } from '@/stores/player-store'
import { usePrefetchStore } from '@/stores/prefetch-store'
import { resumeAudioContext } from '@/lib/audio/engine-instance'

interface RecentItem {
  id: string
  title: string
  type: 'album' | 'track'
  updated_at: string
  cover_path: string | null
  album_id: string | null
  album_title: string | null
}

interface Invite {
  id: string
  token: string
  role: string
  expires_at: string
  used_at: string | null
}

const ico: Record<string, [string, ...string[]]> = {
  music: ['M9 18V5l12-2v13', 'M6 21a3 3 0 100-6 3 3 3 0 000 6z', 'M18 19a3 3 0 100-6 3 3 3 0 000 6z'],
  disc: ['M12 2a10 10 0 100 20 10 10 0 000-20z', 'M12 8a4 4 0 100 8 4 4 0 000-8z', 'M12 11a1 1 0 100 2 1 1 0 000-2z'],
  upload: ['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12'],
  link: ['M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71', 'M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71'],
  users: ['M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2', 'M9 7a4 4 0 100-8 4 4 0 000 8z', 'M22 21v-2a4 4 0 00-3-3.87', 'M16 3.13a4 4 0 010 7.75'],
  logout: ['M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4', 'M16 17l5-5-5-5', 'M21 12H9'],
  qr: ['M3 3h7v7H3z', 'M14 3h7v7h-7z', 'M3 14h7v7H3z', 'M17 14h1v1h-1z', 'M21 14v3h-2', 'M14 21h3v-2', 'M21 21h-1v-1'],
  close: ['M18 6L6 18', 'M6 6l12 12'],
  arrow: ['M5 12h14', 'M12 5l7 7-7 7'],
  set: ['M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z'],
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

function TeamModal({
  artistId,
  artistName,
  currentUserId,
  onClose,
}: {
  artistId: string
  artistName: string
  currentUserId: string
  onClose: () => void
}) {
  const supabase = createClient()
  const storeMembers = usePrefetchStore(s => s.members)
  const memberAvatarUrls = usePrefetchStore(s => s.memberAvatarUrls)

  const [members, setMembers] = useState(() =>
    storeMembers.map(m => ({
      user_id: m.user_id,
      role: m.role,
      display_name: m.profile?.display_name ?? null,
      avatar_url: memberAvatarUrls[m.user_id] ?? null,
    }))
  )

  const [invites, setInvites] = useState<Invite[]>([])
  const [creating, setCreating] = useState<'editor' | 'viewer' | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [opError, setOpError] = useState<string | null>(null)
  const [closing, setClosing] = useState(false)
  const [visible, setVisible] = useState(false)
  const [deletingInvites, setDeletingInvites] = useState<Set<string>>(new Set())
  const [deletingMembers, setDeletingMembers] = useState<Set<string>>(new Set())
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    void loadInvites()
  }, [])

  const handleClose = () => {
    setClosing(true)
    setTimeout(() => onClose(), 320)
  }

  const loadInvites = async () => {
    const { data } = await supabase.rpc('get_artist_invites', { p_artist_id: artistId })
    setInvites((data ?? []) as Invite[])
  }

  const createInvite = async (role: 'editor' | 'viewer') => {
    setCreating(role)
    setInviteError(null)

    const { data, error } = await supabase.rpc('create_artist_invite', {
      p_artist_id: artistId,
      p_role: role,
    })

    if (error) {
      setInviteError(`Error al crear el código: ${error.message}`)
      setCreating(null)
      return
    }

    if (data?.[0]) {
      setInvites(prev => [data[0] as Invite, ...prev])
    }

    setCreating(null)
  }

  const deleteInvite = async (id: string) => {
    setDeletingInvites(prev => new Set(prev).add(id))
    setOpError(null)

    const { error } = await supabase.rpc('delete_artist_invite', { p_invite_id: id })

    setDeletingInvites(prev => {
      const s = new Set(prev)
      s.delete(id)
      return s
    })

    if (error) {
      setOpError(`No se pudo eliminar el código: ${error.message}`)
      return
    }

    setInvites(prev => prev.filter(i => i.id !== id))
  }

  const removeMember = async (userId: string) => {
    setConfirmRemove(null)
    setDeletingMembers(prev => new Set(prev).add(userId))
    setOpError(null)

    const { error } = await supabase.rpc('remove_artist_member', {
      p_artist_id: artistId,
      p_user_id: userId,
    })

    setDeletingMembers(prev => {
      const s = new Set(prev)
      s.delete(userId)
      return s
    })

    if (error) {
      setOpError(`No se pudo eliminar el miembro: ${error.message}`)
      return
    }

    setMembers(prev => prev.filter(m => m.user_id !== userId))
  }

  const isOwner = members.find(m => m.user_id === currentUserId)?.role === 'owner'

  const changeMemberRole = async (userId: string, role: 'editor' | 'viewer') => {
    const { error } = await supabase.rpc('set_artist_member_role', {
      p_artist_id: artistId,
      p_user_id: userId,
      p_role: role,
    })

    if (error) {
      setOpError(`No se pudo cambiar el rol: ${error.message}`)
      return
    }

    setMembers(prev => prev.map(m => (m.user_id === userId ? { ...m, role } : m)))
  }

  const copyCode = (code: string) => {
    const apply = (c: string) => {
      setCopied(c)
      setTimeout(() => setCopied(null), 2000)
    }

    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code).then(() => apply(code)).catch(() => fallback(code))
    } else {
      fallback(code)
    }
  }

  const fallback = (code: string) => {
    const el = document.createElement('textarea')
    el.value = code
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.focus()
    el.select()
    try {
      document.execCommand('copy')
      setCopied(code)
      setTimeout(() => setCopied(null), 2000)
    } catch {}
    document.body.removeChild(el)
  }

  const activeInvites = invites.filter(i => !i.used_at && new Date(i.expires_at) > new Date())

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    background: visible && !closing ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0)',
    backdropFilter: visible && !closing ? 'blur(8px)' : 'blur(0px)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: 0,
    transition: 'background .32s ease, backdrop-filter .32s ease',
  }

  const panelStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: 560,
    background: '#fafafa',
    borderTop: '1px solid #eee',
    padding: '28px 24px calc(80px + env(safe-area-inset-bottom, 0px))',
    maxHeight: '85dvh',
    overflowY: 'auto',
    fontFamily: 'Outfit, sans-serif',
    transform: visible && !closing ? 'translateY(0)' : 'translateY(100%)',
    opacity: visible && !closing ? 1 : 0,
    transition: 'transform .34s cubic-bezier(0.32, 0.72, 0, 1), opacity .28s ease',
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <div onClick={handleClose} style={overlayStyle}>
      <div onClick={e => e.stopPropagation()} style={panelStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#ccc', margin: '0 0 4px' }}>Equipo</p>
            <h2 style={{ fontSize: 18, fontWeight: 200, color: '#0f0f0f', margin: 0, letterSpacing: '-0.02em' }}>{artistName}</h2>
          </div>
          <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', display: 'flex', padding: 4 }}>
            <Ic n="close" s={16} />
          </button>
        </div>

        {opError && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff0f0', border: '1px solid #ffd5d5', padding: '10px 14px', marginBottom: 20, gap: 12 }}>
            <span style={{ fontSize: 12, color: '#c53030' }}>{opError}</span>
            <button onClick={() => setOpError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c53030', display: 'flex', padding: 2, flexShrink: 0 }}>
              <Ic n="close" s={12} />
            </button>
          </div>
        )}

        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#ccc', margin: '0 0 12px' }}>Miembros</p>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {members.map(m => {
              const initial = (m.display_name ?? '?')[0].toUpperCase()
              const isDeleting = deletingMembers.has(m.user_id)
              const isConfirming = confirmRemove === m.user_id

              return (
                <div key={m.user_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.04)', gap: 8, opacity: isDeleting ? 0.4 : 1, transition: 'opacity .2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', fontSize: 12, fontWeight: 600, color: '#999' }}>
                      {m.avatar_url
                        ? <img src={m.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        : initial}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#0f0f0f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.display_name ?? 'Usuario'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    {isOwner && m.role !== 'owner' ? (
                      isConfirming ? (
                        <>
                          <span style={{ fontSize: 11, color: '#888', whiteSpace: 'nowrap' }}>¿Eliminar?</span>
                          <button
                            onClick={() => void removeMember(m.user_id)}
                            style={{ padding: '3px 9px', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', border: '1px solid #e53e3e', background: '#e53e3e', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 3 }}
                          >
                            Sí
                          </button>
                          <button
                            onClick={() => setConfirmRemove(null)}
                            style={{ padding: '3px 9px', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', border: '1px solid #eee', background: 'transparent', color: '#aaa', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 3 }}
                          >
                            No
                          </button>
                        </>
                      ) : (
                        <>
                          {(['editor', 'viewer'] as const).map(r => (
                            <button
                              key={r}
                              onClick={() => void changeMemberRole(m.user_id, r)}
                              style={{ padding: '3px 8px', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', border: '1px solid', borderColor: m.role === r ? '#0f0f0f' : '#eee', background: m.role === r ? '#0f0f0f' : 'transparent', color: m.role === r ? '#fff' : '#bbb', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s', borderRadius: 3 }}
                            >
                              {r === 'editor' ? 'Editor' : 'Lectura'}
                            </button>
                          ))}
                          <button
                            onClick={() => setConfirmRemove(m.user_id)}
                            disabled={isDeleting}
                            title="Eliminar miembro"
                            style={{ background: 'none', border: '1px solid #eee', cursor: 'pointer', color: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 5, borderRadius: 4, transition: 'all .15s', width: 26, height: 26 }}
                          >
                            {isDeleting
                              ? <span style={{ width: 10, height: 10, border: '1.5px solid #eee', borderTopColor: '#aaa', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                              : <Ic n="close" s={12} />}
                          </button>
                        </>
                      )
                    ) : (
                      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: m.role === 'owner' ? '#888' : '#c0c0c0' }}>
                        {m.role === 'owner' ? 'Owner' : m.role === 'editor' ? 'Editor' : 'Lectura'}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#ccc', margin: '0 0 12px' }}>Invitaciones activas</p>
          {activeInvites.length === 0 ? (
            <p style={{ fontSize: 12, color: '#ddd', padding: '16px 0' }}>No hay códigos activos</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activeInvites.map(inv => {
                const isDel = deletingInvites.has(inv.id)
                return (
                  <div key={inv.id} style={{ background: '#fff', border: '1px solid #f0f0f0', overflow: 'hidden', opacity: isDel ? 0.5 : 1, transition: 'opacity .2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: inv.role === 'editor' ? '#0f0f0f' : '#999', padding: '3px 7px', border: '1px solid', borderColor: inv.role === 'editor' ? '#0f0f0f' : '#eee' }}>
                          {inv.role === 'editor' ? 'Editor' : 'Solo lectura'}
                        </span>
                        <span style={{ fontSize: 11, color: '#ccc' }}>· expira {new Date(inv.expires_at).toLocaleDateString('es', { day: 'numeric', month: 'short' })}</span>
                      </div>
                      <button
                        onClick={() => void deleteInvite(inv.id)}
                        disabled={isDel}
                        title="Revocar código"
                        style={{ background: 'none', border: '1px solid #eee', cursor: isDel ? 'not-allowed' : 'pointer', color: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 5, borderRadius: 4, width: 26, height: 26, transition: 'all .15s' }}
                      >
                        {isDel
                          ? <span style={{ width: 10, height: 10, border: '1.5px solid #eee', borderTopColor: '#aaa', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                          : <Ic n="close" s={12} />}
                      </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, margin: '12px 14px 14px' }}>
                      <div style={{ flex: 1, background: '#f8f8f8', border: '1px solid #f0f0f0', padding: '14px', textAlign: 'center', borderRadius: '2px 0 0 2px' }}>
                        <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: '0.28em', fontFamily: 'monospace', color: '#0f0f0f' }}>{inv.token}</span>
                      </div>
                      <button
                        onClick={() => copyCode(inv.token)}
                        style={{ padding: '0 16px', background: copied === inv.token ? '#0f0f0f' : '#fff', border: '1px solid', borderLeft: 'none', borderColor: copied === inv.token ? '#0f0f0f' : '#f0f0f0', cursor: 'pointer', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: copied === inv.token ? '#fff' : '#999', fontFamily: 'inherit', transition: 'all .15s', flexShrink: 0, borderRadius: '0 2px 2px 0', minWidth: 64 }}
                      >
                        {copied === inv.token ? '✓' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#ccc', margin: '0 0 10px' }}>Generar código de invitación</p>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => void createInvite('editor')}
              disabled={creating !== null}
              style={{ flex: 1, padding: '11px 16px', background: '#0f0f0f', color: '#fff', border: 'none', cursor: creating !== null ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 500, fontFamily: 'inherit', opacity: creating !== null ? 0.5 : 1, transition: 'opacity .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              {creating === 'editor' ? <span style={{ width: 12, height: 12, border: '1.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} /> : null}
              + Editor
            </button>
            <button
              onClick={() => void createInvite('viewer')}
              disabled={creating !== null}
              style={{ flex: 1, padding: '11px 16px', background: '#fff', color: '#0f0f0f', border: '1px solid #eee', cursor: creating !== null ? 'not-allowed' : 'pointer', fontSize: 12, fontWeight: 500, fontFamily: 'inherit', opacity: creating !== null ? 0.5 : 1, transition: 'opacity .15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              {creating === 'viewer' ? <span style={{ width: 12, height: 12, border: '1.5px solid #ccc', borderTopColor: '#0f0f0f', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} /> : null}
              + Solo lectura
            </button>
          </div>
          {inviteError && <p style={{ fontSize: 11, color: '#e05', marginTop: 8 }}>{inviteError}</p>}
          {!inviteError && <p style={{ fontSize: 11, color: '#ccc', marginTop: 8 }}>Los códigos caducan en 7 días y son de un solo uso.</p>}
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function HomePage() {
  const ready = usePrefetchStore(s => s.ready)
  const userId = usePrefetchStore(s => s.userId)
  const profile = usePrefetchStore(s => s.profile)
  const artist = usePrefetchStore(s => s.artist)
  const storeAlbums = usePrefetchStore(s => s.albums)
  const storeTracks = usePrefetchStore(s => s.tracks)
  const storeVersions = usePrefetchStore(s => s.versions)
  const storeCoverUrls = usePrefetchStore(s => s.coverUrls)
  const storeAudioUrls = usePrefetchStore(s => s.audioUrls)
  const storeStems = usePrefetchStore(s => s.stems)
  const stemAudioUrls = usePrefetchStore(s => s.stemAudioUrls)
  const avatarUrl = usePrefetchStore(s => s.artistAvatarUrl)
  const storeMembers = usePrefetchStore(s => s.members)
  const memberAvatarUrls = usePrefetchStore(s => s.memberAvatarUrls)

  const [showQR, setShowQR] = useState(false)
  const [showTeam, setShowTeam] = useState(false)
  const [recentView, setRecentView] = useState<'grid' | 'list'>('grid')
  const [playingId, setPlayingId] = useState<string | null>(null)

  const router = useRouter()
  const heroRef = useRef<HTMLElement>(null)
  const { setRightActions, setMiniInfo } = useHeaderContext()
  const openPlayer = usePlayerStore(s => s.openPlayer)
  const setPlaying = usePlayerStore(s => s.setPlaying)

  const buildStems = (versionId: string) => {
    return storeStems
      .filter(s => s.version_id === versionId)
      .map(s => ({
        id: s.id,
        label: s.label,
        stemType: s.stem_type,
        audioUrl: stemAudioUrls[s.id] ?? null,
      }))
      .filter(stem => !!stem.audioUrl)
  }

  const recent = useMemo<RecentItem[]>(() => {
    const items: RecentItem[] = [
      ...storeAlbums.map(a => ({
        id: a.id,
        title: a.title,
        type: 'album' as const,
        updated_at: a.updated_at,
        cover_path: a.cover_path,
        album_id: null,
        album_title: null,
      })),
      ...storeTracks.map(t => ({
        id: t.id,
        title: t.title,
        type: 'track' as const,
        updated_at: t.updated_at,
        cover_path: t.cover_path ?? t.albums?.cover_path ?? null,
        album_id: t.album_id,
        album_title: t.albums?.title ?? null,
      })),
    ]

    return items.sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at)).slice(0, 6)
  }, [storeAlbums, storeTracks])

  const teamMembers = useMemo(
    () =>
      storeMembers.map(m => ({
        user_id: m.user_id,
        role: m.role,
        display_name: m.profile?.display_name ?? null,
        avatar_url: memberAvatarUrls[m.user_id] ?? null,
      })),
    [storeMembers, memberAvatarUrls]
  )

  const playTrack = async (item: RecentItem) => {
    if (playingId) return

    const activeVer = storeVersions.find(v => v.track_id === item.id && v.is_active)
    if (!activeVer) return

    setPlayingId(item.id)

    try {
      await resumeAudioContext()

      const audioUrl = storeAudioUrls[activeVer.id]
      if (!audioUrl) return

      openPlayer({
        trackId: item.id,
        trackTitle: item.title,
        coverUrl: storeCoverUrls[item.id] ?? null,
        versions: [
          {
            id: activeVer.id,
            label: activeVer.label,
            audioUrl,
            bpm: activeVer.bpm,
            key: activeVer.key,
          },
        ],
        initialVersionId: activeVer.id,
        stems: buildStems(activeVer.id),
      })

      setPlaying(true)
    } finally {
      setPlayingId(null)
    }
  }

  const playAlbum = async (item: RecentItem) => {
    if (playingId) return

    setPlayingId(item.id)

    try {
      await resumeAudioContext()

      const albumTracks = storeTracks
        .filter(t => t.album_id === item.id)
        .sort((a, b) => (a.position ?? 999) - (b.position ?? 999))

      if (!albumTracks.length) return

      const queue: Array<{
        trackId: string
        trackTitle: string
        coverUrl: string | null
        versions: Array<{
          id: string
          label: string
          audioUrl: string
          bpm?: number | null
          key?: string | null
        }>
        stems: Array<{
          id: string
          label: string
          stemType: 'vocals' | 'drums' | 'bass' | 'other'
          audioUrl: string | null
        }>
      }> = []

      for (const t of albumTracks) {
        const activeVer = storeVersions.find(v => v.track_id === t.id && v.is_active)
        if (!activeVer) continue

        const audioUrl = storeAudioUrls[activeVer.id]
        if (!audioUrl) continue

        queue.push({
          trackId: t.id,
          trackTitle: t.title,
          coverUrl: storeCoverUrls[t.id] ?? storeCoverUrls[item.id] ?? null,
          versions: [
            {
              id: activeVer.id,
              label: activeVer.label,
              audioUrl,
              bpm: activeVer.bpm,
              key: activeVer.key,
            },
          ],
          stems: buildStems(activeVer.id),
        })
      }

      if (!queue.length) return

      openPlayer({
        trackId: queue[0].trackId ?? null,
        trackTitle: queue[0].trackTitle,
        coverUrl: queue[0].coverUrl ?? null,
        versions: queue[0].versions,
        initialVersionId: queue[0].versions[0]?.id ?? null,
        stems: queue[0].stems,
        queue,
        queueIndex: 0,
      })

      setPlaying(true)
    } finally {
      setPlayingId(null)
    }
  }

  useEffect(() => {
    setRightActions(
      <>
        <button className="ghost-btn" onClick={() => setShowQR(true)}>
          <Ic n="qr" s={16} />
        </button>
      </>
    )

    return () => {
      setRightActions(null)
      setMiniInfo(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
  }, [avatarUrl, artist, setMiniInfo])

  if (!ready) {
    return (
      <div className="loader-wrap">
        <div className="loader" />
        <style>{styles}</style>
      </div>
    )
  }

  const hour = new Date().getHours()
  const greet = hour < 6 ? 'Buenas noches' : hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches'
  const firstName = profile?.display_name?.split(' ')[0]

  return (
    <div className="page">
      <style>{styles}</style>

      {showTeam && artist && (
        <TeamModal
          artistId={artist.id}
          artistName={artist.name}
          currentUserId={userId ?? ''}
          onClose={() => setShowTeam(false)}
        />
      )}

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
      </section>

      {artist && (
        <section className="team-strip" onClick={() => setShowTeam(true)}>
          <div className="team-avatars">
            {teamMembers.slice(0, 3).map((m, i) => {
              const initial = (m.display_name ?? '?')[0].toUpperCase()
              return (
                <div key={m.user_id} className="team-avatar-circle" style={{ zIndex: 3 - i, marginLeft: i > 0 ? -10 : 0 }}>
                  {m.avatar_url
                    ? <img src={m.avatar_url} alt="" className="team-avatar-img" />
                    : <span className="team-avatar-ph">{initial}</span>}
                </div>
              )
            })}
            <div className="team-plus-btn" style={{ marginLeft: -6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
          </div>
          <span className="team-label">{teamMembers.length} miembro{teamMembers.length !== 1 ? 's' : ''}</span>
          <Ic n="arrow" s={14} c="#bbb" />
        </section>
      )}

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
        ) : recentView === 'grid' ? (
          <div className="recent-grid">
            {recent.map((item, i) => (
              <div
                key={item.id}
                className="rc"
                role="button"
                tabIndex={0}
                style={{ animationDelay: `${i * 0.06}s` }}
                onClick={() => router.push(item.type === 'album' ? `/albums/${item.id}` : `/tracks/${item.id}`)}
              >
                <div className="rc-cover">
                  {storeCoverUrls[item.id]
                    ? <img src={storeCoverUrls[item.id]} alt="" />
                    : (
                      <div className={`rc-cover-placeholder ${item.type}`}>
                        <Ic n={item.type === 'album' ? 'disc' : 'music'} s={18} c="currentColor" />
                      </div>
                    )}

                  <span className={`rc-badge ${item.type}`}>
                    {item.type === 'album' ? 'Álbum' : 'Track'}
                  </span>

                  <button
                    onClick={e => {
                      e.stopPropagation()
                      void (item.type === 'track' ? playTrack(item) : playAlbum(item))
                    }}
                    style={{ position: 'absolute', bottom: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(15,15,15,0.72)', backdropFilter: 'blur(4px)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}
                  >
                    {playingId === item.id
                      ? <span style={{ width: 10, height: 10, border: '1.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                      : <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff" stroke="none"><path d="M5 3l14 9-14 9V3z"/></svg>}
                  </button>
                </div>

                <div className="rc-body">
                  <span className="rc-title">{item.title}</span>
                  <span className="rc-meta">
                    {item.type === 'track' && item.album_title && (
                      <>
                        <span className="rc-album-name">{item.album_title}</span>
                        <span className="rc-sep">·</span>
                      </>
                    )}
                    {item.type === 'track' && !item.album_id && (
                      <>
                        <span className="rc-single">Single</span>
                        <span className="rc-sep">·</span>
                      </>
                    )}
                    <TimeAgo date={item.updated_at} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="recent-list">
            {recent.map((item, i) => (
              <div
                key={item.id}
                className="rl"
                role="button"
                tabIndex={0}
                style={{ animationDelay: `${i * 0.04}s` }}
                onClick={() => router.push(item.type === 'album' ? `/albums/${item.id}` : `/tracks/${item.id}`)}
              >
                <div className="rl-cover">
                  {storeCoverUrls[item.id]
                    ? <img src={storeCoverUrls[item.id]} alt="" />
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
                      <>
                        <span className="rc-sep">·</span>
                        <span className="rc-album-name">{item.album_title}</span>
                      </>
                    )}
                    {item.type === 'track' && !item.album_id && (
                      <>
                        <span className="rc-sep">·</span>
                        <span className="rc-single">Single</span>
                      </>
                    )}
                  </span>
                </div>

                <span className="rl-time"><TimeAgo date={item.updated_at} /></span>

                <button
                  onClick={e => {
                    e.stopPropagation()
                    void (item.type === 'track' ? playTrack(item) : playAlbum(item))
                  }}
                  style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.07)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  {playingId === item.id
                    ? <span style={{ width: 10, height: 10, border: '1.5px solid #ccc', borderTopColor: '#0f0f0f', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                    : <svg width="10" height="10" viewBox="0 0 24 24" fill="#0f0f0f" stroke="none"><path d="M5 3l14 9-14 9V3z"/></svg>}
                </button>
              </div>
            ))}
          </div>
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

  .page { position: relative; min-height: 100dvh; font-family: 'Outfit', -apple-system, system-ui, sans-serif; background: transparent; overflow-x: hidden; padding-top: 56px; padding-bottom: 140px; }

  .hero { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; padding: 36px 24px 32px; text-align: center; animation: fadeUp .6s cubic-bezier(0.16,1,0.3,1) both; }
  .hero-img-wrap { position: relative; width: 140px; height: 140px; margin-bottom: 28px; flex-shrink: 0; }
  .hero-img { width: 100%; height: 100%; object-fit: cover; display: block; position: relative; z-index: 1; }
  .hero-img-shadow { position: absolute; inset: 8px; z-index: 0; filter: blur(28px) saturate(1.6); opacity: 0.3; background-size: cover; background-position: center; }
  .greet { font-size: 12px; color: #888; font-weight: 400; letter-spacing: 0.04em; margin-bottom: 8px; }
  .artist-name { font-size: clamp(28px, 7vw, 40px); font-weight: 200; letter-spacing: -0.035em; color: #0f0f0f; line-height: 1.08; margin-bottom: 2px; }
  .handle { font-size: 12px; color: #999; margin-bottom: 6px; letter-spacing: 0.01em; }
  .bio { font-size: 13px; color: #777; line-height: 1.6; max-width: 360px; margin-bottom: 0; font-weight: 300; }

  .section-label { font-size: 10px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: #999; margin: 0; }
  .section-header { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
  .section-count { font-size: 10px; font-weight: 500; color: #aaa; background: rgba(0,0,0,0.04); padding: 2px 7px; border-radius: 4px; }

  .team-strip {
    display: flex; align-items: center; gap: 12px;
    max-width: 560px; margin: 0 auto;
    padding: 16px 24px 20px;
    cursor: pointer; transition: opacity .15s;
    animation: fadeUp .5s cubic-bezier(0.16,1,0.3,1) .06s both;
  }
  .team-strip:hover { opacity: 0.75; }
  .team-strip:active { opacity: 0.6; }
  .team-avatars { display: flex; align-items: center; }
  .team-avatar-circle {
    width: 32px; height: 32px; border-radius: 50%;
    overflow: hidden; flex-shrink: 0;
    background: #f0f0f0;
    border: 2px solid #fafafa;
    display: flex; align-items: center; justify-content: center;
  }
  .team-avatar-img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .team-avatar-ph { font-size: 11px; font-weight: 600; color: #999; line-height: 1; }
  .team-plus-btn {
    width: 28px; height: 28px; border-radius: 50%;
    background: rgba(0,0,0,0.04); border: 1.5px dashed rgba(0,0,0,0.12);
    display: flex; align-items: center; justify-content: center;
    color: #aaa; flex-shrink: 0;
  }
  .team-label { font-size: 12px; font-weight: 400; color: #999; flex: 1; letter-spacing: 0.01em; }

  .recent-section { position: relative; z-index: 1; max-width: 560px; margin: 0 auto; padding: 0 24px; animation: fadeUp .6s cubic-bezier(0.16,1,0.3,1) .12s both; }

  .empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 52px 20px; text-align: center; }
  .empty-icon { width: 56px; height: 56px; border-radius: 16px; background: rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.04); display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
  .empty-title { font-size: 14px; color: #888; font-weight: 400; }
  .empty-sub { font-size: 12px; color: #aaa; font-weight: 300; }

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
  .rc-meta { font-size: 11px; color: #999; display: flex; align-items: center; gap: 4px; overflow: hidden; white-space: nowrap; font-weight: 400; }
  .rc-sep { color: #bbb; }
  .rc-album-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #888; }
  .rc-single { color: #a09890; font-style: italic; }

  .view-toggle { display:flex; gap:2px; margin-left:auto; }
  .vt-btn { display:flex; align-items:center; justify-content:center; width:28px; height:28px; background:none; border:1px solid transparent; border-radius:5px; cursor:pointer; color:#aaa; transition:all .15s; }
  .vt-btn:hover { color:#999; background:rgba(0,0,0,0.02); }
  .vt-btn.active { color:#0f0f0f; background:rgba(0,0,0,0.04); border-color:rgba(0,0,0,0.05); }

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
  .rl-meta { font-size:11px; color:#999; display:flex; align-items:center; gap:4px; overflow:hidden; white-space:nowrap; }
  .rl-type { font-size:9px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; }
  .rl-type.album { color:#0f0f0f; }
  .rl-type.track { color:#999; }
  .rl-time { font-size:11px; color:#aaa; flex-shrink:0; }

  .loader-wrap { min-height: 100dvh; background: #fafafa; display: flex; align-items: center; justify-content: center; }
  .loader { width: 18px; height: 18px; border: 1.5px solid #eee; border-top-color: #0f0f0f; border-radius: 50%; animation: spin .7s linear infinite; }

  .qr-overlay { position: fixed; inset: 0; z-index: 200; background: rgba(250,250,250,0.6); backdrop-filter: blur(20px); display: flex; align-items: center; justify-content: center; padding: 24px; }
  .qr-box { background: #fff; padding: 36px; display: flex; flex-direction: column; align-items: center; gap: 24px; width: 100%; max-width: 280px; box-shadow: 0 16px 64px rgba(0,0,0,0.08); border-radius: 8px; }
`