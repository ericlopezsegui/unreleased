'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useHeaderContext } from '@/lib/header-context'

interface Album { id: string; title: string; description: string | null; cover_path: string | null; is_archived: boolean; updated_at: string; track_count?: number }

function Ic({ d, s = 16 }: { d: string | string[]; s?: number }) {
  const paths = Array.isArray(d) ? d : [d]
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((p, i) => <path key={i} d={p} />)}
    </svg>
  )
}

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [artistId, setArtistId] = useState<string | null>(null)
  const [coverUrls, setCoverUrls] = useState<Record<string, string>>({})
  const [albumsView, setAlbumsView] = useState<'grid' | 'list'>('grid')
  const router = useRouter()
  const supabase = createClient()
  const { setTitle, setBackHref, setRightActions } = useHeaderContext()

  useEffect(() => {
    setTitle('Álbumes')
    setBackHref('/home')
    setRightActions(
      <button onClick={() => router.push('/albums/new')} className="hdr-new-btn">
        <Ic d="M12 5v14M5 12h14" s={12} /> Nuevo
      </button>
    )
    return () => { setTitle(''); setBackHref(''); setRightActions(null) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: membership } = await supabase
        .from('artist_members').select('artist_id').eq('user_id', user.id).limit(1).single()
      if (!membership) { router.push('/home'); return }

      setArtistId(membership.artist_id)

      const { data } = await supabase
        .from('albums')
        .select('id,title,description,cover_path,is_archived,updated_at')
        .eq('artist_id', membership.artist_id)
        .order('updated_at', { ascending: false })

      const albumList = (data ?? []) as Album[]

      // Contar tracks por álbum
      if (albumList.length) {
        const { data: trackData } = await supabase
          .from('tracks').select('album_id').eq('artist_id', membership.artist_id).not('album_id', 'is', null)
        const countMap: Record<string, number> = {}
        ;(trackData ?? []).forEach((t: any) => { countMap[t.album_id] = (countMap[t.album_id] ?? 0) + 1 })
        albumList.forEach(a => { a.track_count = countMap[a.id] ?? 0 })
      }

      setAlbums(albumList)

      // Signed URLs para portadas
      const urls: Record<string, string> = {}
      for (const a of albumList) {
        if (a.cover_path) {
          const { data: u } = await supabase.storage.from('covers').createSignedUrl(a.cover_path, 3600)
          if (u?.signedUrl) urls[a.id] = u.signedUrl
        }
      }
      setCoverUrls(urls)
      setLoading(false)
    })()
  }, [])

  if (loading) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
      <div style={{ width: 16, height: 16, border: '1.5px solid #eee', borderTopColor: '#0f0f0f', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100dvh', background: '#fafafa', fontFamily: 'Outfit, sans-serif', paddingTop: 52 }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0;transform:translateY(10px) } to { opacity:1;transform:none } }
        @keyframes scaleIn { from { opacity:0;transform:scale(0.96) translateY(8px) } to { opacity:1;transform:scale(1) translateY(0) } }
        .alb-card { display:flex; flex-direction:column; background:rgba(255,255,255,0.65); backdrop-filter:blur(8px); border:1px solid rgba(0,0,0,0.04); border-radius:6px; overflow:hidden; cursor:pointer; font-family:inherit; text-align:left; transition:all .25s cubic-bezier(0.16,1,0.3,1); animation:scaleIn .5s cubic-bezier(0.16,1,0.3,1) both; }
        .alb-card:hover { transform:translateY(-2px); box-shadow:0 8px 32px rgba(0,0,0,0.06); border-color:rgba(0,0,0,0.07); background:rgba(255,255,255,0.9); }
        .alb-card:active { transform:translateY(0) scale(0.985); }
        .alb-cover { position:relative; width:100%; aspect-ratio:1; overflow:hidden; background:#f3f3f3; }
        .alb-cover img { width:100%; height:100%; object-fit:cover; display:block; transition:transform .4s cubic-bezier(0.16,1,0.3,1); }
        .alb-card:hover .alb-cover img { transform:scale(1.04); }
        .alb-body { padding:12px 14px 14px; display:flex; flex-direction:column; gap:2px; }
        .alb-title { font-size:13px; font-weight:600; color:#0f0f0f; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; letter-spacing:-0.01em; }
        .alb-meta { font-size:11px; color:#b5b5b5; font-weight:400; }
        .view-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; animation:fadeUp .4s ease both; }
        .view-toggle { display:flex; gap:2px; }
        .vt-btn { display:flex; align-items:center; justify-content:center; width:28px; height:28px; background:none; border:1px solid transparent; border-radius:5px; cursor:pointer; color:#d0d0d0; transition:all .15s; }
        .vt-btn:hover { color:#999; background:rgba(0,0,0,0.02); }
        .vt-btn.active { color:#0f0f0f; background:rgba(0,0,0,0.04); border-color:rgba(0,0,0,0.05); }
        .alb-list { display:flex; flex-direction:column; gap:2px; }
        .alb-list-item { display:flex; align-items:center; gap:14px; padding:8px 12px; background:rgba(255,255,255,0.5); backdrop-filter:blur(8px); border:1px solid rgba(0,0,0,0.03); border-radius:6px; cursor:pointer; font-family:inherit; text-align:left; transition:all .2s cubic-bezier(0.16,1,0.3,1); animation:fadeUp .35s cubic-bezier(0.16,1,0.3,1) both; }
        .alb-list-item:hover { background:rgba(255,255,255,0.85); border-color:rgba(0,0,0,0.06); box-shadow:0 2px 12px rgba(0,0,0,0.03); }
        .alb-list-item:active { transform:scale(0.99); }
        .alb-list-cover { width:48px; height:48px; border-radius:4px; overflow:hidden; flex-shrink:0; background:#f3f3f3; }
        .alb-list-cover img { width:100%; height:100%; object-fit:cover; display:block; }
        .alb-list-ph { width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#f0f0f0,#e8e8e8); color:#ccc; }
        .alb-list-info { flex:1; min-width:0; display:flex; flex-direction:column; gap:2px; }
        .alb-list-title { font-size:13px; font-weight:600; color:#0f0f0f; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; letter-spacing:-0.01em; }
        .alb-list-meta { font-size:11px; color:#b5b5b5; font-weight:400; }
      `}</style>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '28px 24px 60px' }}>
        {albums.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '60px 0', textAlign: 'center', animation: 'fadeUp .4s ease both' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <Ic d={['M12 2a10 10 0 100 20A10 10 0 0012 2z', 'M12 8a4 4 0 100 8 4 4 0 000-8z', 'M12 11a1 1 0 100 2 1 1 0 000-2z']} s={24} />
            </div>
            <p style={{ fontSize: 14, color: '#b0b0b0', fontWeight: 400 }}>No hay álbumes todavía</p>
            <button onClick={() => router.push('/albums/new')} className="new-btn" style={{ marginTop: 8 }}>
              Crear primer álbum
            </button>
          </div>
        ) : (
          <>
            <div className="view-header">
              <span className="alb-meta" style={{ fontSize: 12 }}>{albums.length} álbum{albums.length !== 1 ? 'es' : ''}</span>
              <div className="view-toggle">
                <button className={`vt-btn${albumsView === 'grid' ? ' active' : ''}`} onClick={() => setAlbumsView('grid')} aria-label="Cuadrícula">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                </button>
                <button className={`vt-btn${albumsView === 'list' ? ' active' : ''}`} onClick={() => setAlbumsView('list')} aria-label="Lista">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><rect x="3" y="4" width="4" height="4" rx="0.5"/><rect x="3" y="10" width="4" height="4" rx="0.5"/><rect x="3" y="16" width="4" height="4" rx="0.5"/></svg>
                </button>
              </div>
            </div>
            {albumsView === 'grid' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                {albums.map((album, i) => (
                  <button key={album.id} onClick={() => router.push(`/albums/${album.id}`)} className="alb-card" style={{ animationDelay: `${i * 0.06}s` }}>
                    <div className="alb-cover">
                      {coverUrls[album.id]
                        ? <img src={coverUrls[album.id]} alt="" />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0f0f0, #e8e8e8)', color: '#ccc' }}><Ic d={['M12 2a10 10 0 100 20A10 10 0 0012 2z', 'M12 8a4 4 0 100 8 4 4 0 000-8z']} s={24} /></div>}
                    </div>
                    <div className="alb-body">
                      <span className="alb-title">{album.title}</span>
                      <span className="alb-meta">{album.track_count ?? 0} tracks</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="alb-list">
                {albums.map((album, i) => (
                  <button key={album.id} onClick={() => router.push(`/albums/${album.id}`)} className="alb-list-item" style={{ animationDelay: `${i * 0.04}s` }}>
                    <div className="alb-list-cover">
                      {coverUrls[album.id]
                        ? <img src={coverUrls[album.id]} alt="" />
                        : <div className="alb-list-ph"><Ic d={['M12 2a10 10 0 100 20A10 10 0 0012 2z', 'M12 8a4 4 0 100 8 4 4 0 000-8z']} s={16} /></div>}
                    </div>
                    <div className="alb-list-info">
                      <span className="alb-list-title">{album.title}</span>
                      <span className="alb-list-meta">{album.track_count ?? 0} tracks</span>
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
