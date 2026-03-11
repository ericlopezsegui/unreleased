'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useHeaderContext } from '@/lib/header-context'
import { usePlayerStore } from '@/stores/player-store'
import { usePrefetchStore } from '@/stores/prefetch-store'
import { resumeAudioContext } from '@/lib/audio/engine-instance'

function Ic({ d, s = 16, c = 'currentColor' }: { d: string | string[]; s?: number; c?: string }) {
  const paths = Array.isArray(d) ? d : [d]
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((p, i) => <path key={i} d={p} />)}
    </svg>
  )
}

export default function AlbumPage() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const supabase = createClient()

  // Prefetch store
  const ready = usePrefetchStore(s => s.ready)
  const storeAlbums = usePrefetchStore(s => s.albums)
  const storeTracks = usePrefetchStore(s => s.tracks)
  const storeVersions = usePrefetchStore(s => s.versions)
  const storeCoverUrls = usePrefetchStore(s => s.coverUrls)
  const storeAudioUrls = usePrefetchStore(s => s.audioUrls)
  const updateAlbum = usePrefetchStore(s => s.updateAlbum)
  const setCoverUrlStore = usePrefetchStore(s => s.setCoverUrl)

  // Derived from store
  const album = storeAlbums.find(a => a.id === id) ?? null
  const tracks = storeTracks.filter(t => t.album_id === id).sort((a, b) => (a.position ?? 999) - (b.position ?? 999))
  const coverUrl = storeCoverUrls[id] ?? null

  const [playingIdx, setPlayingIdx] = useState<number | null>(null)
  // Edit state
  const [editing, setEditing] = useState(false)
  const [editVisible, setEditVisible] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null)
  const [editCoverPreview, setEditCoverPreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const { setTitle, setBackHref, setRightActions } = useHeaderContext()
  const openPlayer = usePlayerStore(s => s.openPlayer)
  const setPlaying = usePlayerStore(s => s.setPlaying)

  const playFromTrack = async (startIndex: number) => {
    if (playingIdx !== null) return

    setPlayingIdx(startIndex)

    try {
      await resumeAudioContext()

      const queue = []

      for (const t of tracks) {
        const activeVer = storeVersions.find(v => v.track_id === t.id && v.is_active)
        if (!activeVer?.audio_path) continue

        let audioUrl = storeAudioUrls[activeVer.id]

        if (!audioUrl) {
          const { data: urlData } = await supabase.storage
            .from('audio')
            .createSignedUrl(activeVer.audio_path, 3600)

          if (!urlData?.signedUrl) continue
          audioUrl = urlData.signedUrl
        }

        queue.push({
          trackId: t.id,
          trackTitle: t.title,
          coverUrl: coverUrl,
          versions: [
            {
              id: activeVer.id,
              label: activeVer.label,
              audioUrl,
              bpm: activeVer.bpm,
              key: activeVer.key,
            },
          ],
          stems: [
            { id: `${t.id}-vocals`, label: 'Voces' },
            { id: `${t.id}-drums`, label: 'Batería' },
            { id: `${t.id}-bass`, label: 'Bajo' },
            { id: `${t.id}-inst`, label: 'Instrumentos' },
          ],
        })
      }

      if (!queue.length) return

      let qIdx = 0
      const targetTrackId = tracks[startIndex]?.id

      if (targetTrackId) {
        const idx = queue.findIndex(item => item.trackId === targetTrackId)
        if (idx >= 0) qIdx = idx
      }

      const first = queue[qIdx]

      openPlayer({
        trackId: first.trackId ?? null,
        trackTitle: first.trackTitle,
        coverUrl: first.coverUrl ?? null,
        versions: first.versions,
        initialVersionId: first.versions[0]?.id ?? null,
        stems: first.stems ?? [],
        queue,
        queueIndex: qIdx,
      })

      setPlaying(true)
    } finally {
      setPlayingIdx(null)
    }
  }

  useEffect(() => {
    if (!ready || !album) return
    setTitle(album.title)
    setBackHref('/albums')
    setRightActions(
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={openEdit} className="hdr-sec-btn">
          <Ic d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" s={12} /> Editar
        </button>
        <button onClick={() => router.push(`/tracks/new?album=${id}&artist=${usePrefetchStore.getState().artistId}`)} className="hdr-new-btn">
          <Ic d="M12 5v14M5 12h14" s={12} /> Track
        </button>
      </div>
    )
    return () => { setTitle(''); setBackHref(''); setRightActions(null) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [album, ready])

  const openEdit = () => {
    setEditTitle(album?.title ?? '')
    setEditDescription(album?.description ?? '')
    setEditCoverFile(null)
    setEditCoverPreview(coverUrl)
    setSaveError(null)
    setEditing(true)
    requestAnimationFrame(() => setEditVisible(true))
  }

  const closeEdit = () => {
    setEditVisible(false)
    setTimeout(() => setEditing(false), 320)
  }

  const handleEditCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setEditCoverFile(f)
    setEditCoverPreview(URL.createObjectURL(f))
  }

  const saveAlbum = async () => {
    if (!editTitle.trim()) { setSaveError('El título es obligatorio'); return }
    setSaving(true); setSaveError(null)
    let newCoverPath = album?.cover_path ?? null
    if (editCoverFile) {
      const ext = editCoverFile.name.split('.').pop()
      const path = `artist/${usePrefetchStore.getState().artistId}/album-cover-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('covers').upload(path, editCoverFile, { upsert: true })
      if (upErr) { setSaveError(`Error al subir imagen: ${upErr.message}`); setSaving(false); return }
      newCoverPath = path
    }
    const { error: dbErr } = await supabase.from('albums').update({
      title: editTitle.trim(),
      description: editDescription.trim() || null,
      cover_path: newCoverPath,
    }).eq('id', id)
    if (dbErr) { setSaveError(dbErr.message); setSaving(false); return }
    updateAlbum(id, { title: editTitle.trim(), description: editDescription.trim() || null, cover_path: newCoverPath })
    if (editCoverFile && editCoverPreview) setCoverUrlStore(id, editCoverPreview)
    setSaving(false)
    closeEdit()
  }

  if (!ready || !album) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
      <div style={{ width: 16, height: 16, border: '1.5px solid #eee', borderTopColor: '#0f0f0f', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100dvh', background: '#fafafa', fontFamily: 'Outfit, sans-serif', paddingTop: 56 }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity:0;transform:translateY(12px) } to { opacity:1;transform:none } }

        /* Hero */
        .alb-hero { position:relative; width:100%; height:min(320px,82vw); overflow:hidden; background:#0f0f0f; }
        .alb-hero-blur { position:absolute; inset:-28px; background-size:cover; background-position:center; filter:blur(44px) saturate(1.7); opacity:0.75; transform:scale(1.15); }
        .alb-hero-cover { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:min(220px,58%); aspect-ratio:1; border-radius:16px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.3), 0 20px 64px rgba(0,0,0,0.65), inset 0 0 0 1px rgba(255,255,255,0.14); }
        .alb-hero-cover img { width:100%; height:100%; object-fit:cover; display:block; }
        .alb-hero-placeholder { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:min(220px,58%); aspect-ratio:1; border-radius:16px; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center; }

        /* Track rows */
        .track-row { display:flex; align-items:center; gap:12px; padding:12px 14px; background:#fff; border:1px solid rgba(0,0,0,0.04); border-radius:10px; cursor:pointer; width:100%; text-align:left; font-family:inherit; transition:box-shadow .18s, border-color .18s; animation:fadeUp .38s cubic-bezier(0.16,1,0.3,1) both; box-shadow:0 1px 3px rgba(0,0,0,0.03); }
        .track-row:hover { box-shadow:0 4px 16px rgba(0,0,0,0.08); border-color:rgba(0,0,0,0.08); }
        .track-row:active { transform:scale(0.99); }

        /* Play chip */
        .play-chip { display:inline-flex; align-items:center; gap:8px; background:#0f0f0f; color:#fff; border:none; cursor:pointer; padding:10px 20px; border-radius:100px; font-family:inherit; font-size:13px; font-weight:500; letter-spacing:-0.01em; transition:transform .13s, box-shadow .18s; box-shadow:0 2px 20px rgba(15,15,15,0.2); }
        .play-chip:hover { box-shadow:0 4px 28px rgba(15,15,15,0.3); }
        .play-chip:active { transform:scale(0.95); }
        .play-chip:disabled { background:#ccc; box-shadow:none; cursor:not-allowed; }

        /* Overlay */
        .edit-overlay { position:fixed; inset:0; z-index:100; display:flex; align-items:flex-end; justify-content:center; transition:background .32s ease, backdrop-filter .32s ease; }
        .edit-panel { width:100%; max-width:560px; background:#fafafa; border-top:1px solid #eee; padding:28px 24px 52px; max-height:90dvh; overflow-y:auto; font-family:Outfit,sans-serif; transition:transform .34s cubic-bezier(0.32,0.72,0,1), opacity .28s ease; border-radius:20px 20px 0 0; position:relative; }
        .edit-label { display:block; font-size:10px; font-weight:600; letter-spacing:0.2em; text-transform:uppercase; color:#999; margin-bottom:8px; }
        .edit-input { width:100%; padding:12px 14px; border:1px solid rgba(0,0,0,0.08); background:#fff; font-size:14px; font-family:inherit; outline:none; box-sizing:border-box; border-radius:8px; transition:border-color .2s, box-shadow .2s; color:#0f0f0f; }
        .edit-input:focus { border-color:rgba(0,0,0,0.2); box-shadow:0 0 0 3px rgba(0,0,0,0.04); }
        .save-btn { width:100%; padding:14px; background:#0f0f0f; color:#fff; border:none; cursor:pointer; font-size:13px; font-weight:500; font-family:inherit; border-radius:10px; transition:all .2s; display:flex; align-items:center; justify-content:center; gap:8px; }
        .save-btn:disabled { background:#ccc; cursor:not-allowed; }
        .save-btn:not(:disabled):hover { background:#2a2a2a; }
        .drag-handle { width:36px; height:4px; border-radius:2px; background:rgba(0,0,0,0.1); margin:0 auto 20px; }
      `}</style>

      {/* ── HERO ── */}
      <div className="alb-hero">
        {coverUrl && <div className="alb-hero-blur" style={{ backgroundImage: `url(${coverUrl})` }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.65) 100%)' }} />
        {coverUrl
          ? <div className="alb-hero-cover"><img src={coverUrl} alt="" /></div>
          : <div className="alb-hero-placeholder"><Ic d={['M12 2a10 10 0 100 20A10 10 0 0012 2z', 'M12 8a4 4 0 100 8 4 4 0 000-8z']} s={40} c="rgba(255,255,255,0.25)" /></div>
        }
      </div>

      {/* ── BODY ── */}
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 20px 140px' }}>

        {/* Title + meta */}
        <div style={{ marginBottom: 20, animation: 'fadeUp .38s ease both' }}>
          <h1 style={{ fontSize: 28, fontWeight: 200, color: '#0f0f0f', margin: '0 0 6px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>{album?.title}</h1>
          {album?.description && <p style={{ fontSize: 13, color: '#888', lineHeight: 1.65, margin: '0 0 8px', fontWeight: 300 }}>{album.description}</p>}
          <span style={{ fontSize: 11, color: '#bbb', fontWeight: 400 }}>{tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}</span>
        </div>

        {/* Play button */}
        {tracks.length > 0 && (
          <div style={{ marginBottom: 28, animation: 'fadeUp .38s .04s ease both' }}>
            <button
              className="play-chip"
              onClick={() => playFromTrack(0)}
              disabled={playingIdx !== null}
            >
              {playingIdx !== null
                ? <span style={{ width: 10, height: 10, border: '1.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                : <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff" stroke="none"><path d="M5 3l14 9-14 9V3z"/></svg>}
              Reproducir álbum
            </button>
          </div>
        )}

        {/* Tracks */}
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#bbb', margin: '0 0 12px' }}>Tracks</p>
        {tracks.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '48px 0', textAlign: 'center', animation: 'fadeUp .38s ease both' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
              <Ic d={['M9 18V5l12-2v13', 'M6 21a3 3 0 100-6 3 3 0 000 6z', 'M18 19a3 3 0 100-6 3 3 0 000 6z']} s={22} c="#ccc" />
            </div>
            <p style={{ fontSize: 14, color: '#888', fontWeight: 400, margin: 0 }}>Sin tracks todavía</p>
            <button onClick={() => router.push(`/tracks/new?album=${id}&artist=${usePrefetchStore.getState().artistId}`)} className="play-chip" style={{ background: 'rgba(0,0,0,0.07)', color: '#444', boxShadow: 'none', marginTop: 12 }}>
              <Ic d="M12 5v14M5 12h14" s={13} c="#444" /> Añadir track
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {tracks.map((track, i) => (
              <div key={track.id} onClick={() => router.push(`/tracks/${track.id}`)} role="button" tabIndex={0} className="track-row" style={{ animationDelay: `${i * 0.04}s` }}>
                <button
                  onClick={e => { e.stopPropagation(); playFromTrack(i) }}
                  style={{ width: 28, height: 28, borderRadius: '50%', background: playingIdx === i ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.04)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#999', transition: 'all .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.09)'; e.currentTarget.style.color = '#444' }}
                  onMouseLeave={e => { e.currentTarget.style.background = playingIdx === i ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.04)'; e.currentTarget.style.color = '#999' }}
                >
                  {playingIdx === i
                    ? <span style={{ width: 9, height: 9, border: '1.5px solid #ccc', borderTopColor: '#666', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                    : <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M5 3l14 9-14 9V3z"/></svg>}
                </button>
                <span style={{ width: 22, fontSize: 12, color: '#ccc', textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{track.position ?? i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: '#0f0f0f', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>{track.title}</p>
                </div>
                <Ic d="M9 18l6-6-6-6" s={14} c="#ccc" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit panel */}
      {editing && (
        <div onClick={closeEdit} className="edit-overlay" style={{ background: editVisible ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0)', backdropFilter: editVisible ? 'blur(8px)' : 'blur(0px)' }}>
          <div onClick={e => e.stopPropagation()} className="edit-panel" style={{ transform: editVisible ? 'translateY(0)' : 'translateY(100%)', opacity: editVisible ? 1 : 0 }}>
            <div className="drag-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 500, color: '#0f0f0f', margin: 0, letterSpacing: '-0.01em' }}>Editar álbum</h2>
              <button onClick={closeEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', display: 'flex', padding: 4 }}>
                <Ic d="M18 6L6 18M6 6l12 12" s={15} />
              </button>
            </div>

            {/* Cover */}
            <div style={{ marginBottom: 20 }}>
              <label className="edit-label">Portada</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div onClick={() => coverInputRef.current?.click()} style={{ width: 80, height: 80, borderRadius: 10, overflow: 'hidden', border: '1.5px dashed #e0e0e0', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.01)' }}>
                  {editCoverPreview
                    ? <img src={editCoverPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    : <Ic d={['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12']} s={18} c="#ccc" />}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button type="button" onClick={() => coverInputRef.current?.click()} style={{ background: 'none', border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer', color: '#888', fontSize: 11, fontWeight: 500, fontFamily: 'inherit', padding: '7px 14px', borderRadius: 20 }}>
                    {editCoverPreview ? 'Cambiar imagen' : 'Añadir imagen'}
                  </button>
                  {editCoverFile && (
                    <button type="button" onClick={() => { setEditCoverFile(null); setEditCoverPreview(coverUrl) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: 11, fontFamily: 'inherit', textAlign: 'left', padding: 0 }}>Descartar cambio</button>
                  )}
                  <p style={{ fontSize: 11, color: '#bbb', margin: 0 }}>JPG, PNG, WebP</p>
                </div>
                <input ref={coverInputRef} type="file" accept="image/*" onChange={handleEditCover} style={{ display: 'none' }} />
              </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom: 16 }}>
              <label className="edit-label">Título *</label>
              <input className="edit-input" value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Nombre del álbum" />
            </div>

            {/* Description */}
            <div style={{ marginBottom: 24 }}>
              <label className="edit-label">Descripción</label>
              <textarea className="edit-input" value={editDescription} onChange={e => setEditDescription(e.target.value)} placeholder="Descripción del álbum..." style={{ minHeight: 80, resize: 'vertical' }} />
            </div>

            {saveError && <p style={{ fontSize: 12, color: '#e53e3e', marginBottom: 12 }}>{saveError}</p>}
            <button onClick={saveAlbum} disabled={saving} className="save-btn">
              {saving ? <><span style={{ width: 13, height: 13, border: '1.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />Guardando...</> : 'Guardar cambios'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
