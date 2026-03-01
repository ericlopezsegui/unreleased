'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useHeaderContext } from '@/lib/header-context'

interface Track {
  id: string
  title: string
  description: string | null
  cover_path: string | null
  album_id: string | null
  updated_at: string
  albums: { title: string; cover_path: string | null } | null
}

function Ic({ d, s = 16, c = 'currentColor' }: { d: string | string[]; s?: number; c?: string }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      {(Array.isArray(d) ? d : [d]).map((p, i) => <path key={i} d={p} />)}
    </svg>
  )
}

export default function TracksPage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [coverUrls, setCoverUrls] = useState<Record<string, string>>({})
  const [view, setView] = useState<'grid' | 'list'>('list')
  const [filter, setFilter] = useState<'all' | 'singles' | 'albums'>('all')
  const [artistId, setArtistId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const { setTitle, setBackHref, setRightActions } = useHeaderContext()

  useEffect(() => {
    setTitle('Tracks')
    setBackHref('/home')
    setRightActions(
      <button onClick={() => router.push(`/tracks/new${artistId ? `?artist=${artistId}` : ''}`)} className="hdr-new-btn">
        <Ic d="M12 5v14M5 12h14" s={12} /> Nuevo
      </button>
    )
    return () => { setTitle(''); setBackHref(''); setRightActions(null) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artistId])

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: membership } = await supabase
        .from('artist_members').select('artist_id').eq('user_id', user.id).limit(1).single()
      if (!membership) { router.push('/home'); return }

      setArtistId(membership.artist_id)

      const { data } = await supabase
        .from('tracks')
        .select('id,title,description,cover_path,album_id,updated_at,albums(title,cover_path)')
        .eq('artist_id', membership.artist_id)
        .order('updated_at', { ascending: false })

      const list = (data ?? []) as unknown as Track[]
      setTracks(list)

      // Signed URLs — track cover first, album cover as fallback
      const urls: Record<string, string> = {}
      for (const t of list) {
        const path = t.cover_path ?? (t.albums as any)?.cover_path ?? null
        if (path) {
          const { data: u } = await supabase.storage.from('covers').createSignedUrl(path, 3600)
          if (u?.signedUrl) urls[t.id] = u.signedUrl
        }
      }
      setCoverUrls(urls)
      setLoading(false)
    })()
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
      <div style={{ width: 16, height: 16, border: '1.5px solid #eee', borderTopColor: '#0f0f0f', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform:rotate(360deg) } }`}</style>
    </div>
  )

  const filtered = tracks.filter(t => {
    if (filter === 'singles') return !t.album_id
    if (filter === 'albums') return !!t.album_id
    return true
  })

  const singlesCount = tracks.filter(t => !t.album_id).length
  const albumCount = tracks.filter(t => !!t.album_id).length

  return (
    <div style={{ minHeight: '100dvh', background: '#fafafa', fontFamily: 'Outfit, sans-serif', paddingTop: 52 }}>
      <style>{`
        @keyframes spin { to { transform:rotate(360deg) } }
        @keyframes fadeUp { from { opacity:0;transform:translateY(10px) } to { opacity:1;transform:none } }
        @keyframes scaleIn { from { opacity:0;transform:scale(0.96) translateY(8px) } to { opacity:1;transform:scale(1) translateY(0) } }

        .filter-row { display:flex; gap:4px; }
        .filter-btn { padding:5px 12px; font-size:11px; font-weight:500; font-family:inherit; background:none; border:1px solid rgba(0,0,0,0.06); border-radius:4px; cursor:pointer; color:#b0b0b0; transition:all .15s; }
        .filter-btn.active { background:#0f0f0f; color:#fff; border-color:#0f0f0f; }
        .filter-btn:not(.active):hover { color:#0f0f0f; border-color:rgba(0,0,0,0.12); }

        .view-header { display:flex; align-items:center; gap:8px; margin-bottom:14px; }
        .view-toggle { display:flex; gap:2px; margin-left:auto; }
        .vt-btn { display:flex; align-items:center; justify-content:center; width:28px; height:28px; background:none; border:1px solid transparent; border-radius:5px; cursor:pointer; color:#d0d0d0; transition:all .15s; }
        .vt-btn:hover { color:#999; background:rgba(0,0,0,0.02); }
        .vt-btn.active { color:#0f0f0f; background:rgba(0,0,0,0.04); border-color:rgba(0,0,0,0.05); }

        /* Grid */
        .trk-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; }
        .trk-card { display:flex; flex-direction:column; background:rgba(255,255,255,0.65); backdrop-filter:blur(8px); border:1px solid rgba(0,0,0,0.04); border-radius:6px; overflow:hidden; cursor:pointer; font-family:inherit; text-align:left; transition:all .25s cubic-bezier(0.16,1,0.3,1); animation:scaleIn .5s cubic-bezier(0.16,1,0.3,1) both; }
        .trk-card:hover { transform:translateY(-2px); box-shadow:0 8px 32px rgba(0,0,0,0.06); border-color:rgba(0,0,0,0.07); background:rgba(255,255,255,0.9); }
        .trk-card:active { transform:translateY(0) scale(0.985); }
        .trk-cover { position:relative; width:100%; aspect-ratio:1; overflow:hidden; background:#f3f3f3; }
        .trk-cover img { width:100%; height:100%; object-fit:cover; display:block; transition:transform .4s cubic-bezier(0.16,1,0.3,1); }
        .trk-card:hover .trk-cover img { transform:scale(1.04); }
        .trk-cover-ph { width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#f5f3f0,#ede9e5); color:#c8c0b8; }
        .trk-badge { position:absolute; top:8px; left:8px; font-size:9px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; padding:3px 7px; border-radius:3px; backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); background:rgba(255,255,255,0.8); color:#666; border:1px solid rgba(0,0,0,0.06); max-width:calc(100% - 16px); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .trk-body { padding:12px 14px 14px; display:flex; flex-direction:column; gap:2px; }
        .trk-title { font-size:13px; font-weight:600; color:#0f0f0f; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; letter-spacing:-0.01em; }
        .trk-meta { font-size:11px; color:#b5b5b5; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

        /* List */
        .trk-list { display:flex; flex-direction:column; gap:2px; }
        .trk-row { display:flex; align-items:center; gap:14px; padding:8px 12px; background:rgba(255,255,255,0.5); backdrop-filter:blur(8px); border:1px solid rgba(0,0,0,0.03); border-radius:6px; cursor:pointer; font-family:inherit; text-align:left; transition:all .2s cubic-bezier(0.16,1,0.3,1); animation:fadeUp .35s cubic-bezier(0.16,1,0.3,1) both; }
        .trk-row:hover { background:rgba(255,255,255,0.85); border-color:rgba(0,0,0,0.06); box-shadow:0 2px 12px rgba(0,0,0,0.03); }
        .trk-row:active { transform:scale(0.99); }
        .trk-row-cover { width:44px; height:44px; border-radius:5px; overflow:hidden; flex-shrink:0; background:#f3f3f3; }
        .trk-row-cover img { width:100%; height:100%; object-fit:cover; display:block; }
        .trk-row-ph { width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#f5f3f0,#ede9e5); color:#c8c0b8; }
        .trk-row-info { flex:1; min-width:0; display:flex; flex-direction:column; gap:2px; }
        .trk-row-title { font-size:13px; font-weight:500; color:#0f0f0f; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; letter-spacing:-0.01em; }
        .trk-row-meta { font-size:11px; color:#b5b5b5; display:flex; align-items:center; gap:4px; overflow:hidden; white-space:nowrap; }
        .trk-row-badge { font-size:9px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; padding:2px 6px; border-radius:3px; flex-shrink:0; }
        .trk-row-badge.single { background:rgba(0,0,0,0.04); color:#999; }
        .trk-row-badge.album { background:rgba(15,15,15,0.06); color:#666; }
        .trk-row-arrow { color:#d8d8d8; flex-shrink:0; }
      `}</style>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 24px 60px' }}>
        {tracks.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '60px 0', textAlign: 'center', animation: 'fadeUp .4s ease both' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <Ic d={['M9 18V5l12-2v13', 'M6 21a3 3 0 100-6 3 3 0 000 6z', 'M18 19a3 3 0 100-6 3 3 0 000 6z']} s={24} c="#ccc" />
            </div>
            <p style={{ fontSize: 14, color: '#b0b0b0', fontWeight: 400 }}>No hay tracks todavía</p>
            <button onClick={() => router.push(`/tracks/new${artistId ? `?artist=${artistId}` : ''}`)} className="hdr-new-btn" style={{ marginTop: 8 }}>
              Subir primer track
            </button>
          </div>
        ) : (
          <>
            {/* Filter + count + view toggle */}
            <div className="view-header" style={{ marginBottom: 12 }}>
              <div className="filter-row">
                <button className={`filter-btn${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>
                  Todos <span style={{ opacity: 0.6 }}>({tracks.length})</span>
                </button>
                {singlesCount > 0 && (
                  <button className={`filter-btn${filter === 'singles' ? ' active' : ''}`} onClick={() => setFilter('singles')}>
                    Singles <span style={{ opacity: 0.6 }}>({singlesCount})</span>
                  </button>
                )}
                {albumCount > 0 && (
                  <button className={`filter-btn${filter === 'albums' ? ' active' : ''}`} onClick={() => setFilter('albums')}>
                    En álbum <span style={{ opacity: 0.6 }}>({albumCount})</span>
                  </button>
                )}
              </div>
              <div className="view-toggle">
                <button className={`vt-btn${view === 'grid' ? ' active' : ''}`} onClick={() => setView('grid')} aria-label="Cuadrícula">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                </button>
                <button className={`vt-btn${view === 'list' ? ' active' : ''}`} onClick={() => setView('list')} aria-label="Lista">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><rect x="3" y="4" width="4" height="4" rx="0.5"/><rect x="3" y="10" width="4" height="4" rx="0.5"/><rect x="3" y="16" width="4" height="4" rx="0.5"/></svg>
                </button>
              </div>
            </div>

            {filtered.length === 0 ? (
              <p style={{ fontSize: 13, color: '#c0c0c0', padding: '32px 0', textAlign: 'center' }}>No hay tracks en esta categoría</p>
            ) : view === 'grid' ? (
              <div className="trk-grid">
                {filtered.map((t, i) => (
                  <button key={t.id} onClick={() => router.push(`/tracks/${t.id}`)} className="trk-card" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="trk-cover">
                      {coverUrls[t.id]
                        ? <img src={coverUrls[t.id]} alt="" />
                        : <div className="trk-cover-ph"><Ic d={['M9 18V5l12-2v13', 'M6 21a3 3 0 100-6 3 3 0 000 6z', 'M18 19a3 3 0 100-6 3 3 0 000 6z']} s={20} /></div>}
                      <span className="trk-badge">
                        {t.album_id ? (t.albums as any)?.title ?? 'Álbum' : 'Single'}
                      </span>
                    </div>
                    <div className="trk-body">
                      <span className="trk-title">{t.title}</span>
                      {t.description && <span className="trk-meta">{t.description}</span>}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="trk-list">
                {filtered.map((t, i) => (
                  <button key={t.id} onClick={() => router.push(`/tracks/${t.id}`)} className="trk-row" style={{ animationDelay: `${i * 0.03}s` }}>
                    <div className="trk-row-cover">
                      {coverUrls[t.id]
                        ? <img src={coverUrls[t.id]} alt="" />
                        : <div className="trk-row-ph"><Ic d={['M9 18V5l12-2v13', 'M6 21a3 3 0 100-6 3 3 0 000 6z']} s={14} /></div>}
                    </div>
                    <div className="trk-row-info">
                      <span className="trk-row-title">{t.title}</span>
                      <div className="trk-row-meta">
                        <span className={`trk-row-badge ${t.album_id ? 'album' : 'single'}`}>
                          {t.album_id ? (t.albums as any)?.title ?? 'Álbum' : 'Single'}
                        </span>
                        {t.description && <><span style={{ color: '#e0e0e0' }}>·</span><span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.description}</span></>}
                      </div>
                    </div>
                    <div className="trk-row-arrow">
                      <Ic d="M9 18l6-6-6-6" s={14} />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
