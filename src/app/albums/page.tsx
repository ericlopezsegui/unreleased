'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useHeaderContext } from '@/lib/header-context'
import { usePlayerStore } from '@/stores/player-store'
import { usePrefetchStore } from '@/stores/prefetch-store'
import { resumeAudioContext } from '@/lib/audio/engine-instance'

function Ic({ d, s = 16 }: { d: string | string[]; s?: number }) {
  const paths = Array.isArray(d) ? d : [d]
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((p, i) => <path key={i} d={p} />)}
    </svg>
  )
}

export default function AlbumsPage() {
  const albums = usePrefetchStore(s => s.albums)
  const coverUrls = usePrefetchStore(s => s.coverUrls)
  const ready = usePrefetchStore(s => s.ready)
  const versions = usePrefetchStore(s => s.versions)
  const tracks = usePrefetchStore(s => s.tracks)
  const audioUrls = usePrefetchStore(s => s.audioUrls)
  const storeStems = usePrefetchStore(s => s.stems)
  const stemAudioUrls = usePrefetchStore(s => s.stemAudioUrls)

  const [albumsView, setAlbumsView] = useState<'grid' | 'list'>('grid')
  const [playingId, setPlayingId] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()
  const { setTitle, setRightActions } = useHeaderContext()

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
  }

  const playAlbum = async (albumId: string) => {
    if (playingId) return

    setPlayingId(albumId)

    try {
      await resumeAudioContext()

      const albumTracks = tracks
        .filter(t => t.album_id === albumId)
        .sort((a, b) => (a.position ?? 999) - (b.position ?? 999))

      if (!albumTracks.length) return

      const albumCoverUrl = coverUrls[albumId] ?? null

      const playerTracks: Array<{
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
        initialVersionId: string
        stems: Array<{
          id: string
          label: string
          stemType: 'vocals' | 'drums' | 'bass' | 'other'
          audioUrl: string | null
        }>
      }> = []

      for (const t of albumTracks) {
        const trackVersions = versions.filter(v => v.track_id === t.id)
        if (!trackVersions.length) continue

        const playableVersions: Array<{
          id: string
          label: string
          audioUrl: string
          bpm?: number | null
          key?: string | null
        }> = []

        for (const v of trackVersions) {
          let signedUrl = audioUrls[v.id]

          if (!signedUrl && v.audio_path) {
            const { data: urlData } = await supabase
              .storage
              .from('audio')
              .createSignedUrl(v.audio_path, 3600)

            if (urlData?.signedUrl) {
              signedUrl = urlData.signedUrl
            }
          }

          if (!signedUrl) continue

          playableVersions.push({
            id: v.id,
            label: v.label,
            audioUrl: signedUrl,
            bpm: v.bpm,
            key: v.key,
          })
        }

        if (!playableVersions.length) continue

        const activeVersion =
          trackVersions.find(v => v.is_active && playableVersions.some(pv => pv.id === v.id)) ??
          trackVersions.find(v => playableVersions.some(pv => pv.id === v.id))

        if (!activeVersion) continue

        const trackCoverUrl = coverUrls[t.id] ?? albumCoverUrl

        playerTracks.push({
          trackId: t.id,
          trackTitle: t.title,
          coverUrl: trackCoverUrl,
          versions: playableVersions,
          initialVersionId: activeVersion.id,
          stems: buildStems(activeVersion.id),
        })
      }

      if (!playerTracks.length) return

      openPlayer({
        trackId: playerTracks[0].trackId,
        trackTitle: playerTracks[0].trackTitle,
        coverUrl: playerTracks[0].coverUrl,
        versions: playerTracks[0].versions,
        initialVersionId: playerTracks[0].initialVersionId,
        stems: playerTracks[0].stems,
        queue: playerTracks.map((track) => ({
          trackId: track.trackId,
          trackTitle: track.trackTitle,
          coverUrl: track.coverUrl,
          versions: track.versions,
          stems: track.stems,
        })),
        queueIndex: 0,
      })

      setPlaying(true)
    } finally {
      setPlayingId(null)
    }
  }

  useEffect(() => {
    setTitle('Álbumes')
    setRightActions(
      <button onClick={() => router.push('/albums/new')} className="hdr-new-btn">
        <Ic d="M12 5v14M5 12h14" s={12} /> Nuevo
      </button>
    )
    return () => {
      setTitle('')
      setRightActions(null)
    }
  }, [router, setRightActions, setTitle])

  if (!ready) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
        <div style={{ width: 16, height: 16, border: '1.5px solid #eee', borderTopColor: '#0f0f0f', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#fafafa', fontFamily: 'Outfit, sans-serif', paddingTop: 56 }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
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
        .alb-meta { font-size:11px; color:#999; font-weight:400; }
        .view-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; animation:fadeUp .4s ease both; }
        .view-toggle { display:flex; gap:2px; }
        .vt-btn { display:flex; align-items:center; justify-content:center; width:28px; height:28px; background:none; border:1px solid transparent; border-radius:5px; cursor:pointer; color:#aaa; transition:all .15s; }
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
        .alb-list-meta { font-size:11px; color:#999; font-weight:400; }
      `}</style>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '28px 24px 140px' }}>
        {albums.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '60px 0', textAlign: 'center', animation: 'fadeUp .4s ease both' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <Ic d={['M12 2a10 10 0 100 20A10 10 0 0012 2z', 'M12 8a4 4 0 100 8 4 4 0 000-8z', 'M12 11a1 1 0 100 2 1 1 0 000-2z']} s={24} />
            </div>
            <p style={{ fontSize: 14, color: '#888', fontWeight: 400 }}>No hay álbumes todavía</p>
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
                  <div
                    key={album.id}
                    onClick={() => router.push(`/albums/${album.id}`)}
                    role="button"
                    tabIndex={0}
                    className="alb-card"
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    <div className="alb-cover">
                      {coverUrls[album.id]
                        ? <img src={coverUrls[album.id]} alt="" />
                        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0f0f0, #e8e8e8)', color: '#ccc' }}><Ic d={['M12 2a10 10 0 100 20A10 10 0 0012 2z', 'M12 8a4 4 0 100 8 4 4 0 000-8z']} s={24} /></div>}

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          void playAlbum(album.id)
                        }}
                        style={{ position: 'absolute', bottom: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: 'rgba(15,15,15,0.72)', backdropFilter: 'blur(4px)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                      >
                        {playingId === album.id
                          ? <span style={{ width: 10, height: 10, border: '1.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                          : <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff" stroke="none"><path d="M5 3l14 9-14 9V3z"/></svg>}
                      </button>
                    </div>

                    <div className="alb-body">
                      <span className="alb-title">{album.title}</span>
                      <span className="alb-meta">{album.track_count ?? 0} tracks</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alb-list">
                {albums.map((album, i) => (
                  <div
                    key={album.id}
                    onClick={() => router.push(`/albums/${album.id}`)}
                    role="button"
                    tabIndex={0}
                    className="alb-list-item"
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
                    <div className="alb-list-cover">
                      {coverUrls[album.id]
                        ? <img src={coverUrls[album.id]} alt="" />
                        : <div className="alb-list-ph"><Ic d={['M12 2a10 10 0 100 20A10 10 0 0012 2z', 'M12 8a4 4 0 100 8 4 4 0 000-8z']} s={16} /></div>}
                    </div>

                    <div className="alb-list-info">
                      <span className="alb-list-title">{album.title}</span>
                      <span className="alb-list-meta">{album.track_count ?? 0} tracks</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        void playAlbum(album.id)
                      }}
                      style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.07)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    >
                      {playingId === album.id
                        ? <span style={{ width: 10, height: 10, border: '1.5px solid #ccc', borderTopColor: '#0f0f0f', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                        : <svg width="10" height="10" viewBox="0 0 24 24" fill="#0f0f0f" stroke="none"><path d="M5 3l14 9-14 9V3z"/></svg>}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}