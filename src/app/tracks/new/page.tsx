'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useHeaderContext } from '@/lib/header-context'
import { analyzeAudio } from '@/lib/analyze-audio'
import { usePrefetchStore } from '@/stores/prefetch-store'

function Ic({ d, s = 16, c = 'currentColor' }: { d: string | string[]; s?: number; c?: string }) {
  const paths = Array.isArray(d) ? d : [d]
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((p, i) => <path key={i} d={p} />)}
    </svg>
  )
}

function formatBytes(b: number) {
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
  return `${(b / 1024 / 1024).toFixed(1)} MB`
}

function NewTrackPageContent({ albumId, artistId }: { albumId: string | null; artistId: string | null }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [versionLabel, setVersionLabel] = useState('v1')
  const [bpm, setBpm] = useState('')
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const audioRef = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()
  const [analyzing, setAnalyzing] = useState(false)
  const { setTitle: setHeaderTitle, setBackHref: setHeaderBackHref } = useHeaderContext()

  useEffect(() => {
    setHeaderTitle('Nuevo track')
    setHeaderBackHref('')
    return () => { setHeaderTitle(''); setHeaderBackHref('') }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setAudioFile(f)
    setAnalyzing(true)
    const result = await analyzeAudio(f)
    if (result.bpm) setBpm(String(result.bpm))
    if (result.key) setKey(result.key)
    setAnalyzing(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (!f || !f.type.startsWith('audio/')) return
    setAudioFile(f)
    setAnalyzing(true)
    const result = await analyzeAudio(f)
    if (result.bpm) setBpm(String(result.bpm))
    if (result.key) setKey(result.key)
    setAnalyzing(false)
  }

  const handleCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setCoverFile(f)
    const url = URL.createObjectURL(f)
    setCoverPreview(url)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('El título es obligatorio'); return }
    setLoading(true); setError(null); setProgress(0)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // Obtener artistId si no viene por params
    let aId = artistId
    if (!aId) {
      const { data: m } = await supabase.from('artist_members').select('artist_id').eq('user_id', user.id).limit(1).single()
      aId = m?.artist_id ?? null
    }
    if (!aId) { setError('No tienes un artista asociado'); setLoading(false); return }

    setProgress(10)

    // Subir portada si hay
    let coverPath: string | null = null
    if (coverFile) {
      const ext = coverFile.name.split('.').pop()
      const cpPath = `artist/${aId}/track-cover-${Date.now()}.${ext}`
      const { error: cpErr } = await supabase.storage.from('covers').upload(cpPath, coverFile, { upsert: true })
      if (cpErr) { setError(`Error al subir portada: ${cpErr.message}`); setLoading(false); return }
      coverPath = cpPath
    }
    setProgress(15)

    // Crear track
    const { data: track, error: tErr } = await supabase
      .from('tracks')
      .insert({ artist_id: aId, album_id: albumId || null, title: title.trim(), description: description.trim() || null, cover_path: coverPath })
      .select('id').single()

    if (tErr) { setError(tErr.message); setLoading(false); return }
    setProgress(25)

    // Subir audio si hay
    let audioPath: string | null = null
    if (audioFile) {
      const ext = audioFile.name.split('.').pop()
      const path = `artist/${aId}/track-${track.id}-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('audio').upload(path, audioFile, { upsert: true })
      if (upErr) { setError(`Error al subir audio: ${upErr.message}`); setLoading(false); return }
      audioPath = path
      setProgress(75)
    }

    // Crear versión inicial
    const { data: version, error: vErr } = await supabase.from('track_versions').insert({
      track_id: track.id,
      label: versionLabel.trim() || 'v1',
      audio_path: audioPath,
      bpm: bpm ? parseFloat(bpm) : null,
      key: key.trim() || null,
      is_active: true,
    }).select('id,track_id,label,notes,audio_path,bpm,key,is_active,created_at').single()

    if (vErr) { setError(vErr.message); setLoading(false); return }
    setProgress(100)

    // Update prefetch store so lists refresh instantly
    const store = usePrefetchStore.getState()
    const newTrack = {
      id: track.id, title: title.trim(), description: description.trim() || null,
      cover_path: coverPath, album_id: albumId || null, position: null,
      updated_at: new Date().toISOString(), artist_id: aId!,
      albums: null as { title: string; cover_path: string | null } | null,
    }
    store.addTrack(newTrack)
    if (version) {
      store.addVersion(version)
      // Sign audio URL
      if (version.audio_path) {
        const { data: audioSig } = await supabase.storage.from('audio').createSignedUrl(version.audio_path, 3600)
        if (audioSig?.signedUrl) store.setAudioUrl(version.id, audioSig.signedUrl)
      }
    }
    // Sign cover URL
    if (coverPath) {
      const { data: coverSig } = await supabase.storage.from('covers').createSignedUrl(coverPath, 3600)
      if (coverSig?.signedUrl) store.setCoverUrl(track.id, coverSig.signedUrl)
    }

    setTimeout(() => {
      if (albumId) router.push(`/albums/${albumId}`)
      else router.push(`/tracks/${track.id}`)
    }, 300)
  }

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#999', marginBottom: 8 }
  const inputStyle: React.CSSProperties = { width: '100%', padding: '11px 14px', border: '1px solid rgba(0,0,0,0.06)', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(6px)', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', borderRadius: 5, transition: 'border-color .2s, box-shadow .2s', color: '#0f0f0f' }

  return (
    <div style={{ minHeight: '100dvh', background: '#fafafa', fontFamily: 'Outfit, sans-serif', paddingTop: 56 }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      {/* Barra de progreso */}
      {loading && (
        <div style={{ height: 2, background: '#eee', position: 'sticky', top: 48, zIndex: 29 }}>
          <div style={{ height: '100%', background: '#0f0f0f', width: `${progress}%`, transition: 'width .3s ease' }} />
        </div>
      )}

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 24px 140px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Portada */}
          <div>
            <label style={labelStyle}>Portada (opcional)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                onClick={() => coverRef.current?.click()}
                style={{ width: 88, height: 88, borderRadius: 6, overflow: 'hidden', border: '1.5px dashed #e0e0e0', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: coverPreview ? 'transparent' : 'rgba(0,0,0,0.01)', transition: 'border-color .15s' }}
              >
                {coverPreview
                  ? <img src={coverPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  : <Ic d={['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12']} s={20} c="#ccc" />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button type="button" onClick={() => coverRef.current?.click()}
                  style={{ background: 'none', border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer', color: '#888', fontSize: 11, fontWeight: 500, fontFamily: 'inherit', padding: '7px 14px', borderRadius: 4, transition: 'all .15s', textAlign: 'left' }}>
                  {coverPreview ? 'Cambiar imagen' : 'Elegir imagen'}
                </button>
                {coverPreview && (
                  <button type="button" onClick={() => { setCoverFile(null); setCoverPreview(null) }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: 11, fontFamily: 'inherit', padding: '0 2px', transition: 'color .15s', textAlign: 'left' }}>
                    Quitar
                  </button>
                )}
                <p style={{ fontSize: 11, color: '#999', margin: 0 }}>JPG, PNG, WebP</p>
              </div>
            </div>
            <input ref={coverRef} type="file" accept="image/*" onChange={handleCover} style={{ display: 'none' }} />
          </div>

          {/* Zona de drop de audio */}
          <div>
            <label style={labelStyle}>Archivo de audio</label>
            <div onDrop={handleDrop} onDragOver={e => e.preventDefault()}
              onClick={() => !analyzing && audioRef.current?.click()}
              style={{ border: `2px dashed ${audioFile ? '#0f0f0f' : '#eee'}`, padding: '28px 20px', cursor: analyzing ? 'default' : 'pointer', textAlign: 'center', transition: 'border-color .15s', background: audioFile ? 'rgba(15,15,15,0.02)' : 'transparent' }}>
              {analyzing ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 20, height: 20, border: '2px solid #eee', borderTopColor: '#0f0f0f', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                  <p style={{ fontSize: 12, color: '#aaa', margin: 0 }}>Analizando BPM y tonalidad...</p>
                </div>
              ) : audioFile ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <Ic d={['M9 18V5l12-2v13', 'M6 21a3 3 0 100-6 3 3 0 000 6z', 'M18 19a3 3 0 100-6 3 3 0 000 6z']} s={18} />
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#0f0f0f', margin: 0 }}>{audioFile.name}</p>
                    <p style={{ fontSize: 11, color: '#aaa', margin: '2px 0 0' }}>{formatBytes(audioFile.size)}</p>
                  </div>
                  <button type="button" onClick={e => { e.stopPropagation(); setAudioFile(null); setBpm(''); setKey('') }}
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', display: 'flex' }}>
                    <Ic d="M18 6L6 18M6 6l12 12" s={14} />
                  </button>
                </div>
              ) : (
                <>
                  <Ic d={['M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4', 'M17 8l-5-5-5 5', 'M12 3v12']} s={24} c="#ccc" />
                  <p style={{ fontSize: 13, color: '#bbb', margin: '10px 0 4px' }}>Arrastra o haz clic para subir</p>
                  <p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>MP3, WAV, FLAC, AIFF · BPM y tonalidad se detectan automáticamente</p>
                </>
              )}
            </div>
            <input ref={audioRef} type="file" accept="audio/*,.mp3,.wav,.aac,.ogg,.flac,.m4a,.mp4,audio/mpeg,audio/mp3,audio/wav,audio/aac,audio/ogg,audio/flac,audio/x-m4a,audio/mp4" onChange={handleAudio} style={{ display: 'none' }} />
          </div>

          {/* Título */}
          <div>
            <label style={labelStyle}>Título *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Nombre del track" style={inputStyle} required />
          </div>

          {/* Descripción */}
          <div>
            <label style={labelStyle}>Notas</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Notas sobre este track..."
              style={{ ...inputStyle, minHeight: 72, resize: 'vertical' }} />
          </div>

          {/* Metadatos de versión */}
          <div>
            <label style={labelStyle}>Etiqueta de versión</label>
            <input type="text" value={versionLabel} onChange={e => setVersionLabel(e.target.value)} placeholder="v1, demo, final..." style={inputStyle} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
                BPM {analyzing && <span style={{ width: 8, height: 8, border: '1.5px solid #eee', borderTopColor: '#aaa', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />}
              </label>
              <input type="number" value={bpm} onChange={e => setBpm(e.target.value)} placeholder="128" style={inputStyle} min={40} max={300} />
            </div>
            <div>
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
                Tonalidad {analyzing && <span style={{ width: 8, height: 8, border: '1.5px solid #eee', borderTopColor: '#aaa', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />}
              </label>
              <input type="text" value={key} onChange={e => setKey(e.target.value)} placeholder="Am, C maj..." style={inputStyle} />
            </div>
          </div>

          {error && <p style={{ fontSize: 13, color: '#e53e3e' }}>{error}</p>}

          <button type="submit" disabled={loading}
            style={{ padding: '13px', background: loading ? '#ccc' : '#0f0f0f', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 5, transition: 'all .2s' }}>
            {loading
              ? <><span style={{ width: 14, height: 14, border: '1.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />{audioFile ? 'Subiendo...' : 'Creando...'}</>
              : audioFile ? 'Subir track' : 'Crear track'}
          </button>
        </form>
      </div>
    </div>
  )
}

function NewTrackPageWrapper() {
  const searchParams = useSearchParams()
  return (
    <NewTrackPageContent
      albumId={searchParams.get('album')}
      artistId={searchParams.get('artist')}
    />
  )
}

export default function NewTrackPage() {
  return (
    <Suspense>
      <NewTrackPageWrapper />
    </Suspense>
  )
}
