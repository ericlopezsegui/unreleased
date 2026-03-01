'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useHeaderContext } from '@/lib/header-context'
import { analyzeAudio } from '@/lib/analyze-audio'
import { usePlayerStore, type PlayerVersion } from '@/stores/player-store'

interface Track { id: string; title: string; description: string | null; cover_path: string | null; album_id: string | null; artist_id: string }
interface Version { id: string; label: string; notes: string | null; audio_path: string | null; bpm: number | null; key: string | null; is_active: boolean; created_at: string }

function Ic({ d, s = 16, c = 'currentColor' }: { d: string | string[]; s?: number; c?: string }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      {(Array.isArray(d) ? d : [d]).map((p, i) => <path key={i} d={p} />)}
    </svg>
  )
}

export default function TrackPage() {
  const [track, setTrack] = useState<Track | null>(null)
  const [versions, setVersions] = useState<Version[]>([])
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({})
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
  // Add version state
  const [addingVer, setAddingVer] = useState(false)
  const [addVerVisible, setAddVerVisible] = useState(false)
  const [vLabel, setVLabel] = useState('')
  const [vNotes, setVNotes] = useState('')
  const [vAudioFile, setVAudioFile] = useState<File | null>(null)
  const [vBpm, setVBpm] = useState('')
  const [vKey, setVKey] = useState('')
  const [vAnalyzing, setVAnalyzing] = useState(false)
  const [vSubmitting, setVSubmitting] = useState(false)
  const [vProgress, setVProgress] = useState(0)
  const [vError, setVError] = useState<string | null>(null)
  const vAudioRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const supabase = createClient()
  const { setTitle, setBackHref, setRightActions } = useHeaderContext()

  useEffect(() => {
    ;(async () => {
      const { data: trackData } = await supabase.from('tracks').select('id,title,description,cover_path,album_id,artist_id').eq('id', id).single()
      if (!trackData) { router.push('/home'); return }
      const t = trackData as Track
      setTrack(t)

      // Cover: track's own cover first, then album cover as fallback
      if (t.cover_path) {
        const { data: cu } = await supabase.storage.from('covers').createSignedUrl(t.cover_path, 3600)
        if (cu?.signedUrl) setCoverUrl(cu.signedUrl)
      } else if (t.album_id) {
        const { data: albumData } = await supabase.from('albums').select('cover_path').eq('id', t.album_id).single()
        if (albumData?.cover_path) {
          const { data: cu } = await supabase.storage.from('covers').createSignedUrl(albumData.cover_path, 3600)
          if (cu?.signedUrl) setCoverUrl(cu.signedUrl)
        }
      }

      const { data: versionData } = await supabase
        .from('track_versions').select('id,label,notes,audio_path,bpm,key,is_active,created_at').eq('track_id', id).order('created_at', { ascending: false })
      const vList = (versionData ?? []) as Version[]
      setVersions(vList)

      // Signed URLs para audios
      const urls: Record<string, string> = {}
      for (const v of vList) {
        if (v.audio_path) {
          const { data: u } = await supabase.storage.from('audio').createSignedUrl(v.audio_path, 3600)
          if (u?.signedUrl) urls[v.id] = u.signedUrl
        }
      }
      setAudioUrls(urls)
      setLoading(false)
    })()
  }, [id])

  // Sync track title and action buttons with persistent header
  useEffect(() => {
    if (!track) return
    setTitle(track.title)
    setBackHref(track.album_id ? `/albums/${track.album_id}` : '/tracks')
    setRightActions(
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={openEdit} className="hdr-sec-btn">
          <Ic d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" s={12} /> Editar
        </button>
        <button onClick={openAddVersion} className="hdr-sec-btn">
          <Ic d="M12 5v14M5 12h14" s={12} /> Versión
        </button>
      </div>
    )
    return () => { setTitle(''); setBackHref(''); setRightActions(null) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track])

  const setActive = async (versionId: string) => {
    await supabase.from('track_versions').update({ is_active: false }).eq('track_id', id)
    await supabase.from('track_versions').update({ is_active: true }).eq('id', versionId)
    setVersions(prev => prev.map(v => ({ ...v, is_active: v.id === versionId })))
  }

  const loadTrack = usePlayerStore(s => s.loadTrack)
  const playerCurrentId = usePlayerStore(s => s.currentVersionId)

  const playVersion = (startVersionId?: string) => {
    if (!track || versions.length === 0) return
    const pVersions: PlayerVersion[] = versions
      .filter(v => audioUrls[v.id])
      .map(v => ({ id: v.id, label: v.label, audioUrl: audioUrls[v.id], bpm: v.bpm, key: v.key }))
    if (pVersions.length === 0) return
    const active = versions.find(v => v.is_active) ?? versions[0]
    const initial = startVersionId && audioUrls[startVersionId] ? startVersionId : active.id
    loadTrack({
      trackId: track.id,
      trackTitle: track.title,
      coverUrl: coverUrl,
      versions: pVersions,
      initialVersionId: initial,
    })
  }

  const openAddVersion = () => {
    const nextLabel = `v${versions.length + 1}`
    setVLabel(nextLabel)
    setVNotes('')
    setVAudioFile(null)
    setVBpm('')
    setVKey('')
    setVError(null)
    setVProgress(0)
    setAddingVer(true)
    requestAnimationFrame(() => setAddVerVisible(true))
  }

  const closeAddVersion = () => {
    setAddVerVisible(false)
    setTimeout(() => setAddingVer(false), 320)
  }

  const handleVAudio = async (f: File) => {
    setVAudioFile(f)
    setVAnalyzing(true)
    const result = await analyzeAudio(f)
    if (result.bpm) setVBpm(String(result.bpm))
    if (result.key) setVKey(result.key)
    setVAnalyzing(false)
  }

  const submitVersion = async () => {
    if (!vLabel.trim()) { setVError('El nombre de la versión es obligatorio'); return }
    setVSubmitting(true); setVError(null); setVProgress(10)

    let audioPath: string | null = null
    if (vAudioFile && track) {
      const ext = vAudioFile.name.split('.').pop()
      const path = `artist/${track.artist_id}/track-${id}-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('audio').upload(path, vAudioFile, { upsert: true })
      if (upErr) { setVError(`Error al subir audio: ${upErr.message}`); setVSubmitting(false); return }
      audioPath = path
    }
    setVProgress(75)

    const { data: newVer, error: dbErr } = await supabase.from('track_versions').insert({
      track_id: id,
      label: vLabel.trim(),
      notes: vNotes.trim() || null,
      audio_path: audioPath,
      bpm: vBpm ? parseFloat(vBpm) : null,
      key: vKey.trim() || null,
      is_active: false,
    }).select('id,label,notes,audio_path,bpm,key,is_active,created_at').single()

    if (dbErr) { setVError(dbErr.message); setVSubmitting(false); return }
    setVProgress(100)

    const v = newVer as Version
    if (audioPath) {
      const { data: u } = await supabase.storage.from('audio').createSignedUrl(audioPath, 3600)
      if (u?.signedUrl) setAudioUrls(prev => ({ ...prev, [v.id]: u.signedUrl }))
    }
    setVersions(prev => [v, ...prev])
    setVSubmitting(false)
    closeAddVersion()
  }

  const openEdit = () => {
    setEditTitle(track?.title ?? '')
    setEditDescription(track?.description ?? '')
    setEditCoverFile(null)
    setEditCoverPreview(track?.cover_path ? coverUrl : null)
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

  const saveTrack = async () => {
    if (!editTitle.trim()) { setSaveError('El título es obligatorio'); return }
    setSaving(true); setSaveError(null)
    let newCoverPath = track?.cover_path ?? null
    if (editCoverFile) {
      const ext = editCoverFile.name.split('.').pop()
      const path = `artist/${track!.artist_id}/track-cover-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('covers').upload(path, editCoverFile, { upsert: true })
      if (upErr) { setSaveError(`Error al subir imagen: ${upErr.message}`); setSaving(false); return }
      newCoverPath = path
    }
    const { error: dbErr } = await supabase.from('tracks').update({
      title: editTitle.trim(),
      description: editDescription.trim() || null,
      cover_path: newCoverPath,
    }).eq('id', id)
    if (dbErr) { setSaveError(dbErr.message); setSaving(false); return }
    setTrack(prev => prev ? { ...prev, title: editTitle.trim(), description: editDescription.trim() || null, cover_path: newCoverPath } : prev)
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
    <div style={{ minHeight: '100dvh', background: '#fafafa', fontFamily: 'Outfit, sans-serif', paddingTop: 52 }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeUp { from { opacity:0;transform:translateY(10px) } to { opacity:1;transform:none } }
        .ver-card { border-radius:6px; overflow:hidden; background:rgba(255,255,255,0.65); backdrop-filter:blur(8px); border:1px solid rgba(0,0,0,0.04); transition:all .25s cubic-bezier(0.16,1,0.3,1); animation:fadeUp .4s cubic-bezier(0.16,1,0.3,1) both; }
        .ver-card.active { border-color:rgba(15,15,15,0.15); box-shadow:0 2px 16px rgba(0,0,0,0.04); }
        .tag-active { font-size:9px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#fff; background:#0f0f0f; padding:3px 8px; border-radius:3px; }
        .tag-meta { font-size:11px; color:#b5b5b5; font-weight:400; }
        .activate-btn { font-size:10px; color:#999; background:none; border:1px solid rgba(0,0,0,0.06); cursor:pointer; padding:5px 12px; font-family:inherit; border-radius:3px; transition:all .15s; }
        .activate-btn:hover { border-color:rgba(0,0,0,0.15); color:#0f0f0f; }
        .edit-overlay { position:fixed; inset:0; z-index:100; display:flex; align-items:flex-end; justify-content:center; transition:background .32s ease, backdrop-filter .32s ease; }
        .edit-panel { width:100%; max-width:560px; background:#fafafa; border-top:1px solid #eee; padding:28px 24px 48px; max-height:90dvh; overflow-y:auto; font-family:Outfit,sans-serif; transition:transform .34s cubic-bezier(0.32,0.72,0,1), opacity .28s ease; }
        .edit-label { display:block; font-size:10px; font-weight:600; letter-spacing:0.2em; text-transform:uppercase; color:#b0b0b0; margin-bottom:8px; }
        .edit-input { width:100%; padding:11px 14px; border:1px solid rgba(0,0,0,0.06); background:rgba(255,255,255,0.6); backdrop-filter:blur(6px); font-size:14px; font-family:inherit; outline:none; box-sizing:border-box; border-radius:5px; transition:border-color .2s, box-shadow .2s; color:#0f0f0f; }
        .edit-input:focus { border-color:rgba(0,0,0,0.15); box-shadow:0 0 0 3px rgba(0,0,0,0.04); }
        .save-btn { width:100%; padding:13px; background:#0f0f0f; color:#fff; border:none; cursor:pointer; font-size:13px; font-weight:500; font-family:inherit; border-radius:5px; transition:all .2s; display:flex; align-items:center; justify-content:center; gap:8px; }
        .save-btn:disabled { background:#ccc; cursor:not-allowed; }
        .save-btn:not(:disabled):hover { background:#2a2a2a; }
      `}</style>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '32px 24px 60px', animation: 'fadeUp .4s ease both' }}>
        {coverUrl && (
          <div style={{ width: 96, height: 96, borderRadius: 8, overflow: 'hidden', marginBottom: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', border: '1px solid rgba(0,0,0,0.04)' }}>
            <img src={coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        )}
        <h1 style={{ fontSize: 26, fontWeight: 200, color: '#0f0f0f', margin: '0 0 6px', letterSpacing: '-0.025em', lineHeight: 1.15 }}>{track?.title}</h1>
        {track?.description && <p style={{ fontSize: 13, color: '#a0a0a0', lineHeight: 1.6, margin: '0 0 28px', fontWeight: 300 }}>{track.description}</p>}

        {/* Main play button */}
        {versions.some(v => audioUrls[v.id]) && (
          <button
            onClick={() => playVersion()}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#0f0f0f', color: '#fff', border: 'none', cursor: 'pointer',
              padding: '11px 22px', borderRadius: 100, fontFamily: 'inherit',
              fontSize: 13, fontWeight: 500, letterSpacing: '-0.01em',
              marginBottom: 32, transition: 'transform .15s, box-shadow .2s',
              boxShadow: '0 2px 16px rgba(15,15,15,0.12)',
            }}
            onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.96)')}
            onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Ic d="M5 3l14 9-14 9V3z" s={13} c="#fff" />
            Reproducir
          </button>
        )}

        <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c0c0c0', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          Versiones <span style={{ fontSize: 10, fontWeight: 500, color: '#d0d0d0', background: 'rgba(0,0,0,0.03)', padding: '2px 7px', borderRadius: 4 }}>{versions.length}</span>
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {versions.map((v, i) => (
            <div key={v.id} className={`ver-card ${v.is_active ? 'active' : ''}`} style={{ animationDelay: `${i * 0.05}s` }}>
              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0f0f0f', letterSpacing: '-0.01em' }}>{v.label}</span>
                  {v.is_active && <span className="tag-active">activa</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {v.bpm && <span className="tag-meta">{v.bpm} bpm</span>}
                  {v.key && <span className="tag-meta">{v.key}</span>}
                  {audioUrls[v.id] && (
                    <button
                      onClick={() => playVersion(v.id)}
                      style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: playerCurrentId === v.id ? '#0f0f0f' : 'rgba(15,15,15,0.06)',
                        border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background .15s', flexShrink: 0,
                      }}
                    >
                      <Ic
                        d="M5 3l14 9-14 9V3z"
                        s={10}
                        c={playerCurrentId === v.id ? '#fff' : '#888'}
                      />
                    </button>
                  )}
                  {!v.is_active && (
                    <button onClick={() => setActive(v.id)} className="activate-btn">
                      Activar
                    </button>
                  )}
                </div>
              </div>
              {v.notes && <p style={{ fontSize: 12, color: '#a0a0a0', padding: '10px 16px 14px', margin: 0, lineHeight: 1.55, fontWeight: 300 }}>{v.notes}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Add version panel */}
      {addingVer && (
        <div onClick={closeAddVersion} className="edit-overlay" style={{ background: addVerVisible ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0)', backdropFilter: addVerVisible ? 'blur(8px)' : 'blur(0px)' }}>
          <div onClick={e => e.stopPropagation()} className="edit-panel" style={{ transform: addVerVisible ? 'translateY(0)' : 'translateY(100%)', opacity: addVerVisible ? 1 : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 400, color: '#0f0f0f', margin: 0, letterSpacing: '-0.01em' }}>Nueva versión</h2>
              <button onClick={closeAddVersion} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', display: 'flex', padding: 4 }}>
                <Ic d="M18 6L6 18M6 6l12 12" s={15} />
              </button>
            </div>

            {/* Label */}
            <div style={{ marginBottom: 16 }}>
              <label className="edit-label">Nombre de la versión *</label>
              <input className="edit-input" value={vLabel} onChange={e => setVLabel(e.target.value)} placeholder="v2, demo, final mix..." />
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 20 }}>
              <label className="edit-label">Notas</label>
              <textarea className="edit-input" value={vNotes} onChange={e => setVNotes(e.target.value)} placeholder="Cambios respecto a la versión anterior..." style={{ minHeight: 72, resize: 'vertical' }} />
            </div>

            {/* Audio */}
            <div style={{ marginBottom: 20 }}>
              <label className="edit-label">Archivo de audio</label>
              <div
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f?.type.startsWith('audio/') && !vAnalyzing) handleVAudio(f) }}
                onDragOver={e => e.preventDefault()}
                onClick={() => !vAnalyzing && vAudioRef.current?.click()}
                style={{ border: `2px dashed ${vAudioFile ? '#0f0f0f' : '#eee'}`, padding: '22px 16px', cursor: vAnalyzing ? 'default' : 'pointer', textAlign: 'center', transition: 'border-color .15s', background: vAudioFile ? 'rgba(15,15,15,0.02)' : 'transparent', borderRadius: 5 }}
              >
                {vAnalyzing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 18, height: 18, border: '2px solid #eee', borderTopColor: '#0f0f0f', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                    <p style={{ fontSize: 12, color: '#aaa', margin: 0 }}>Analizando BPM y tonalidad...</p>
                  </div>
                ) : vAudioFile ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <Ic d={['M9 18V5l12-2v13', 'M6 21a3 3 0 100-6 3 3 0 000 6z', 'M18 19a3 3 0 100-6 3 3 0 000 6z']} s={16} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#0f0f0f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{vAudioFile.name}</span>
                    <button type="button" onClick={e => { e.stopPropagation(); setVAudioFile(null); setVBpm(''); setVKey('') }}
                      style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', display: 'flex', flexShrink: 0 }}>
                      <Ic d="M18 6L6 18M6 6l12 12" s={13} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Ic d={['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12']} s={22} c="#ccc" />
                    <p style={{ fontSize: 12, color: '#bbb', margin: '8px 0 0' }}>Arrastra o haz clic para subir</p>
                  </>
                )}
              </div>
              <input ref={vAudioRef} type="file" accept="audio/*,.mp3,.wav,.aac,.ogg,.flac,.m4a,.mp4,audio/mpeg,audio/mp3,audio/wav,audio/aac,audio/ogg,audio/flac,audio/x-m4a,audio/mp4" onChange={e => { const f = e.target.files?.[0]; if (f && !vAnalyzing) handleVAudio(f) }} style={{ display: 'none' }} />
            </div>

            {/* BPM + Key */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              <div>
                <label className="edit-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  BPM {vAnalyzing && <span style={{ width: 8, height: 8, border: '1.5px solid #eee', borderTopColor: '#aaa', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />}
                </label>
                <input className="edit-input" type="number" value={vBpm} onChange={e => setVBpm(e.target.value)} placeholder="128" min={40} max={300} />
              </div>
              <div>
                <label className="edit-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  Tonalidad {vAnalyzing && <span style={{ width: 8, height: 8, border: '1.5px solid #eee', borderTopColor: '#aaa', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />}
                </label>
                <input className="edit-input" value={vKey} onChange={e => setVKey(e.target.value)} placeholder="Am, C maj..." />
              </div>
            </div>

            {vSubmitting && (
              <div style={{ height: 2, background: '#eee', borderRadius: 1, marginBottom: 16, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#0f0f0f', width: `${vProgress}%`, transition: 'width .3s ease' }} />
              </div>
            )}
            {vError && <p style={{ fontSize: 12, color: '#e53e3e', marginBottom: 12 }}>{vError}</p>}
            <button onClick={submitVersion} disabled={vSubmitting || vAnalyzing} className="save-btn">
              {vSubmitting
                ? <><span style={{ width: 13, height: 13, border: '1.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />Subiendo...</>
                : vAudioFile ? 'Subir versión' : 'Guardar versión'}
            </button>
          </div>
        </div>
      )}

      {/* Edit panel */}
      {editing && (
        <div onClick={closeEdit} className="edit-overlay" style={{ background: editVisible ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0)', backdropFilter: editVisible ? 'blur(8px)' : 'blur(0px)' }}>
          <div onClick={e => e.stopPropagation()} className="edit-panel" style={{ transform: editVisible ? 'translateY(0)' : 'translateY(100%)', opacity: editVisible ? 1 : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 400, color: '#0f0f0f', margin: 0, letterSpacing: '-0.01em' }}>Editar track</h2>
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
                    <button type="button" onClick={() => { setEditCoverFile(null); setEditCoverPreview(track?.cover_path ? coverUrl : null) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: 11, fontFamily: 'inherit', textAlign: 'left', padding: 0 }}>Descartar cambio</button>
                  )}
                  <p style={{ fontSize: 11, color: '#c0c0c0', margin: 0 }}>JPG, PNG, WebP</p>
                </div>
                <input ref={coverInputRef} type="file" accept="image/*" onChange={handleEditCover} style={{ display: 'none' }} />
              </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom: 16 }}>
              <label className="edit-label">Título *</label>
              <input className="edit-input" value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Nombre del track" />
            </div>

            {/* Description */}
            <div style={{ marginBottom: 24 }}>
              <label className="edit-label">Notas / Descripción</label>
              <textarea className="edit-input" value={editDescription} onChange={e => setEditDescription(e.target.value)} placeholder="Notas sobre este track..." style={{ minHeight: 80, resize: 'vertical' }} />
            </div>

            {saveError && <p style={{ fontSize: 12, color: '#e53e3e', marginBottom: 12 }}>{saveError}</p>}
            <button onClick={saveTrack} disabled={saving} className="save-btn">
              {saving ? <><span style={{ width: 13, height: 13, border: '1.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />Guardando...</> : 'Guardar cambios'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
