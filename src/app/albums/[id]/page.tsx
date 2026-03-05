'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useHeaderContext } from '@/lib/header-context'

interface Album { id: string; title: string; description: string | null; cover_path: string | null; artist_id: string }
interface Track { id: string; title: string; position: number | null; updated_at: string }

function Ic({ d, s = 16, c = 'currentColor' }: { d: string | string[]; s?: number; c?: string }) {
  const paths = Array.isArray(d) ? d : [d]
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((p, i) => <path key={i} d={p} />)}
    </svg>
  )
}

export default function AlbumPage() {
  const [album, setAlbum] = useState<Album | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
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
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()
  const { setTitle, setBackHref, setRightActions } = useHeaderContext()

  useEffect(() => {
    ;(async () => {
      const { data: albumData } = await supabase.from('albums').select('id,title,description,cover_path,artist_id').eq('id', id).single()
      if (!albumData) { router.push('/albums'); return }
      setAlbum(albumData as Album)

      if (albumData.cover_path) {
        const { data: u } = await supabase.storage.from('covers').createSignedUrl(albumData.cover_path, 3600)
        if (u?.signedUrl) setCoverUrl(u.signedUrl)
      }

      const { data: trackData } = await supabase
        .from('tracks').select('id,title,position,updated_at').eq('album_id', id).order('position', { ascending: true, nullsFirst: false })
      setTracks((trackData ?? []) as Track[])
      setLoading(false)
    })()
  }, [id])

  // Sync album title and action buttons with persistent header
  useEffect(() => {
    if (!album) return
    setTitle(album.title)
    setBackHref('/albums')
    setRightActions(
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={openEdit} className="hdr-sec-btn">
          <Ic d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" s={12} /> Editar
        </button>
        <button onClick={() => router.push(`/tracks/new?album=${id}&artist=${album.artist_id}`)} className="hdr-new-btn">
          <Ic d="M12 5v14M5 12h14" s={12} /> Track
        </button>
      </div>
    )
    return () => { setTitle(''); setBackHref(''); setRightActions(null) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [album])

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
      const path = `artist/${album!.artist_id}/album-cover-${Date.now()}.${ext}`
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
    setAlbum(prev => prev ? { ...prev, title: editTitle.trim(), description: editDescription.trim() || null, cover_path: newCoverPath } : prev)
    if (editCoverFile && editCoverPreview) setCoverUrl(editCoverPreview)
    setSaving(false)
    closeEdit()
  }

  if (loading) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa' }}>
      <div style={{ width: 16, height: 16, border: '1.5px solid #eee', borderTopColor: '#0f0f0f', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100dvh', background: '#fafafa', fontFamily: 'Outfit, sans-serif', paddingTop: 56 }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity:0;transform:translateY(10px) } to { opacity:1;transform:none } }
        .track-row { display:flex; align-items:center; gap:14px; padding:13px 12px; background:rgba(255,255,255,0.5); backdrop-filter:blur(6px); border:1px solid rgba(0,0,0,0.03); border-radius:5px; cursor:pointer; width:100%; text-align:left; font-family:inherit; transition:all .2s cubic-bezier(0.16,1,0.3,1); animation:fadeUp .4s cubic-bezier(0.16,1,0.3,1) both; }
        .track-row:hover { background:rgba(255,255,255,0.85); border-color:rgba(0,0,0,0.06); transform:translateY(-1px); box-shadow:0 2px 12px rgba(0,0,0,0.04); }
        .track-row:active { transform:scale(0.99); }
        .sec-btn { display:flex; align-items:center; gap:5px; background:none; border:1px solid rgba(0,0,0,0.08); cursor:pointer; color:#888; font-size:11px; font-weight:500; font-family:inherit; padding:7px 14px; border-radius:4px; transition:all .2s; }
        .sec-btn:hover { border-color:rgba(0,0,0,0.15); color:#0f0f0f; background:rgba(255,255,255,0.5); }
        .edit-overlay { position:fixed; inset:0; z-index:100; display:flex; align-items:flex-end; justify-content:center; transition:background .32s ease, backdrop-filter .32s ease; }
        .edit-panel { width:100%; max-width:560px; background:#fafafa; border-top:1px solid #eee; padding:28px 24px 48px; max-height:90dvh; overflow-y:auto; font-family:Outfit,sans-serif; transition:transform .34s cubic-bezier(0.32,0.72,0,1), opacity .28s ease; }
        .edit-label { display:block; font-size:10px; font-weight:600; letter-spacing:0.2em; text-transform:uppercase; color:#999; margin-bottom:8px; }
        .edit-input { width:100%; padding:11px 14px; border:1px solid rgba(0,0,0,0.06); background:rgba(255,255,255,0.6); backdrop-filter:blur(6px); font-size:14px; font-family:inherit; outline:none; box-sizing:border-box; border-radius:5px; transition:border-color .2s, box-shadow .2s; color:#0f0f0f; }
        .edit-input:focus { border-color:rgba(0,0,0,0.15); box-shadow:0 0 0 3px rgba(0,0,0,0.04); }
        .save-btn { width:100%; padding:13px; background:#0f0f0f; color:#fff; border:none; cursor:pointer; font-size:13px; font-weight:500; font-family:inherit; border-radius:5px; transition:all .2s; display:flex; align-items:center; justify-content:center; gap:8px; }
        .save-btn:disabled { background:#ccc; cursor:not-allowed; }
        .save-btn:not(:disabled):hover { background:#2a2a2a; }
      `}</style>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 24px 140px' }}>
        {/* Header */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 36, animation: 'fadeUp .4s ease both' }}>
          <div style={{ width: 110, height: 110, background: '#f0f0f0', flexShrink: 0, overflow: 'hidden', borderRadius: 6, position: 'relative' }}>
            {coverUrl
              ? <>
                  <img src={coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'relative', zIndex: 1 }} />
                </>
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0f0f0, #e8e8e8)' }}><Ic d={['M12 2a10 10 0 100 20A10 10 0 0012 2z', 'M12 8a4 4 0 100 8 4 4 0 000-8z']} s={28} c="#ccc" /></div>}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1 style={{ fontSize: 24, fontWeight: 200, color: '#0f0f0f', margin: '0 0 6px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>{album?.title}</h1>
            {album?.description && <p style={{ fontSize: 13, color: '#777', lineHeight: 1.55, margin: 0, fontWeight: 300 }}>{album.description}</p>}
            <p style={{ fontSize: 11, color: '#999', margin: '10px 0 0', fontWeight: 400 }}>{tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}</p>
          </div>
        </div>

        {/* Tracks */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#999', marginBottom: 12 }}>Tracks</p>
          {tracks.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '48px 0', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                <Ic d={['M9 18V5l12-2v13', 'M6 21a3 3 0 100-6 3 3 0 000 6z', 'M18 19a3 3 0 100-6 3 3 0 000 6z']} s={22} c="#bbb" />
              </div>
              <p style={{ fontSize: 14, color: '#888', fontWeight: 400 }}>Aún no hay tracks</p>
              <button onClick={() => router.push(`/tracks/new?album=${id}&artist=${album?.artist_id}`)} className="new-btn" style={{ marginTop: 8 }}>
                Añadir track
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {tracks.map((track, i) => (
                <button key={track.id} onClick={() => router.push(`/tracks/${track.id}`)} className="track-row" style={{ animationDelay: `${i * 0.04}s` }}>
                  <span style={{ width: 24, fontSize: 12, color: '#999', textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{track.position ?? i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 500, color: '#0f0f0f', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>{track.title}</p>
                  </div>
                  <Ic d="M9 18l6-6-6-6" s={13} c="#bbb" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit panel */}
      {editing && (
        <div onClick={closeEdit} className="edit-overlay" style={{ background: editVisible ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0)', backdropFilter: editVisible ? 'blur(8px)' : 'blur(0px)' }}>
          <div onClick={e => e.stopPropagation()} className="edit-panel" style={{ transform: editVisible ? 'translateY(0)' : 'translateY(100%)', opacity: editVisible ? 1 : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 400, color: '#0f0f0f', margin: 0, letterSpacing: '-0.01em' }}>Editar álbum</h2>
              <button onClick={closeEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', display: 'flex', padding: 4 }}>
                <Ic d="M18 6L6 18M6 6l12 12" s={15} />
              </button>
            </div>

            {/* Cover */}
            <div style={{ marginBottom: 20 }}>
              <label className="edit-label">Portada</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div onClick={() => coverInputRef.current?.click()} style={{ width: 80, height: 80, borderRadius: 6, overflow: 'hidden', border: '1.5px dashed #e0e0e0', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.01)' }}>
                  {editCoverPreview
                    ? <img src={editCoverPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    : <Ic d={['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12']} s={18} c="#ccc" />}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <button type="button" onClick={() => coverInputRef.current?.click()} style={{ background: 'none', border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer', color: '#888', fontSize: 11, fontWeight: 500, fontFamily: 'inherit', padding: '7px 14px', borderRadius: 4 }}>
                    {editCoverPreview ? 'Cambiar imagen' : 'Añadir imagen'}
                  </button>
                  {editCoverFile && (
                    <button type="button" onClick={() => { setEditCoverFile(null); setEditCoverPreview(coverUrl) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: 11, fontFamily: 'inherit', textAlign: 'left', padding: 0 }}>Descartar cambio</button>
                  )}
                  <p style={{ fontSize: 11, color: '#999', margin: 0 }}>JPG, PNG, WebP</p>
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
