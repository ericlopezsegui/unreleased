'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useHeaderContext } from '@/lib/header-context'
import { usePrefetchStore } from '@/stores/prefetch-store'

export default function NewAlbumPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const { setTitle: setHeaderTitle, setBackHref: setHeaderBackHref } = useHeaderContext()

  useEffect(() => {
    setHeaderTitle('Nuevo álbum')
    setHeaderBackHref('')
    return () => { setHeaderTitle(''); setHeaderBackHref('') }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setCoverFile(f)
    setCoverPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('El título es obligatorio'); return }
    setLoading(true); setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: membership } = await supabase
      .from('artist_members').select('artist_id').eq('user_id', user.id).limit(1).single()
    if (!membership) { setError('No tienes un artista asociado'); setLoading(false); return }

    let coverPath: string | null = null
    if (coverFile) {
      const ext = coverFile.name.split('.').pop()
      const path = `artist/${membership.artist_id}/album-cover-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('covers').upload(path, coverFile, { upsert: true })
      if (upErr) { setError(`Error al subir portada: ${upErr.message}`); setLoading(false); return }
      coverPath = path
    }

    const { data: album, error: insertErr } = await supabase
      .from('albums')
      .insert({ artist_id: membership.artist_id, title: title.trim(), description: description.trim() || null, cover_path: coverPath })
      .select('id').single()

    if (insertErr) { setError(insertErr.message); setLoading(false); return }

    // Update prefetch store so lists refresh instantly
    const store = usePrefetchStore.getState()
    store.addAlbum({
      id: album.id, title: title.trim(), description: description.trim() || null,
      cover_path: coverPath, is_archived: false, updated_at: new Date().toISOString(), track_count: 0,
    })
    if (coverPath) {
      const { data: coverSig } = await supabase.storage.from('covers').createSignedUrl(coverPath, 3600)
      if (coverSig?.signedUrl) store.setCoverUrl(album.id, coverSig.signedUrl)
    }

    router.push(`/albums/${album.id}`)
  }

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#999', marginBottom: 8 }

  return (
    <div style={{ minHeight: '100dvh', background: '#fafafa', fontFamily: 'Outfit, sans-serif', paddingTop: 56 }}>

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 24px 140px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Portada */}
          <div>
            <label style={labelStyle}>Portada</label>
            <label htmlFor="cover-input" style={{ display: 'block', width: 120, height: 120, background: '#f0f0f0', cursor: 'pointer', overflow: 'hidden', position: 'relative', borderRadius: 6, transition: 'box-shadow .2s' }}>
              {coverPreview
                ? <img src={coverPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'linear-gradient(135deg, #f0f0f0, #e8e8e8)' }}>
                    <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><path d="M17 8l-5-5-5 5" /><path d="M12 3v12" /></svg>
                    <span style={{ fontSize: 10, color: '#999' }}>Subir imagen</span>
                  </div>}
            </label>
            <input id="cover-input" type="file" accept="image/*" onChange={handleCover} style={{ display: 'none' }} />
          </div>

          {/* Título */}
          <div>
            <label style={labelStyle}>Título *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Nombre del álbum" className="input-field" required />
          </div>

          {/* Descripción */}
          <div>
            <label style={labelStyle}>Descripción</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Notas opcionales sobre el álbum..."
              style={{ width: '100%', minHeight: 80, padding: '11px 14px', border: '1px solid rgba(0,0,0,0.06)', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(6px)', fontSize: 14, fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box', borderRadius: 5, transition: 'border-color .2s', color: '#0f0f0f' }} />
          </div>

          {error && <p style={{ fontSize: 13, color: '#e53e3e' }}>{error}</p>}

          <button type="submit" disabled={loading}
            style={{ padding: '13px', background: loading ? '#ccc' : '#0f0f0f', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 500, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 5, transition: 'all .2s' }}>
            {loading ? <><span style={{ width: 14, height: 14, border: '1.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />Creando...</> : 'Crear álbum'}
          </button>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
