'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { WaveBackground } from '@/components/ui/wave-background'

type Step = 'profile' | 'artist' | 'done'

interface CollapseProps {
  open: boolean
  children: React.ReactNode
}

function Collapse({ open, children }: CollapseProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateRows: open ? '1fr' : '0fr',
      opacity: open ? 1 : 0,
      transition: 'grid-template-rows 0.45s cubic-bezier(0.4,0,0.2,1), opacity 0.35s cubic-bezier(0.4,0,0.2,1)',
    }}>
      <div style={{ overflow: 'hidden' }}>{children}</div>
    </div>
  )
}

export default function SetupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<Step>('profile')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transitioning, setTransitioning] = useState(false)

  // Profile fields
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Artist fields
  const [artistName, setArtistName] = useState('')
  const [artistHandle, setArtistHandle] = useState('')
  const [artistBio, setArtistBio] = useState('')
  const [artistAvatarFile, setArtistAvatarFile] = useState<File | null>(null)
  const [artistAvatarPreview, setArtistAvatarPreview] = useState<string | null>(null)

  const profileInputRef = useRef<HTMLInputElement>(null)
  const artistInputRef = useRef<HTMLInputElement>(null)

  const goTo = useCallback((next: Step) => {
    setTransitioning(true)
    setError(null)
    setTimeout(() => {
      setStep(next)
      setTransitioning(false)
    }, 280)
  }, [])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'artist') => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    if (type === 'profile') { setAvatarFile(file); setAvatarPreview(url) }
    else { setArtistAvatarFile(file); setArtistAvatarPreview(url) }
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayName.trim()) { setError('El nombre es obligatorio'); return }
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      let avatarPath: string | null = null

      if (avatarFile) {
        const ext = avatarFile.name.split('.').pop()
        const path = `user/${user.id}/avatar.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, avatarFile, { upsert: true })
        if (uploadError) throw uploadError
        avatarPath = path
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: displayName.trim(),
          avatar_path: avatarPath,
        })
      if (profileError) throw profileError

      goTo('artist')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const handleArtistSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!artistName.trim()) { setError('El nombre del artista es obligatorio'); return }
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      const handle = artistHandle.trim().toLowerCase().replace(/[^a-z0-9_]/g, '') || null

      // 1. Insertar artista (el trigger on_artist_created_add_owner
      //    añade automáticamente el owner en artist_members)
      const { data: artistData, error: artistError } = await supabase
        .from('artists')
        .insert({
          owner_user_id: user.id,
          name: artistName.trim(),
          handle,
          bio: artistBio.trim() || null,
        })
        .select('id')
        .single()

      if (artistError) throw artistError

      // 2. Subir avatar del artista si hay uno
      if (artistAvatarFile && artistData) {
        const ext = artistAvatarFile.name.split('.').pop()
        const path = `artist/${artistData.id}/avatar.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, artistAvatarFile, { upsert: true })

        if (!uploadError) {
          await supabase
            .from('artists')
            .update({ avatar_path: path })
            .eq('id', artistData.id)
        }
      }

      // 3. Marcar onboarding completado
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', user.id)

      goTo('done')
      setTimeout(() => router.push('/home'), 1800)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const skipArtist = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').update({ onboarding_completed: true }).eq('user_id', user.id)
    }
    router.push('/onboarding')
  }

  const steps: Step[] = ['profile', 'artist', 'done']
  const stepIndex = steps.indexOf(step)

  return (
    <div className="relative min-h-screen bg-[#fafafa]">
      <WaveBackground />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="w-full pt-12 pb-4 flex justify-center animate-fade-in-up">
          <div className="flex flex-col items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[#0f0f0f] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 200, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#0f0f0f' }}>
              unreleased
            </h1>
            <div style={{ width: 40, height: 1, background: '#ddd' }} />
          </div>
        </header>

        {/* Step indicator */}
        <div className="flex justify-center mt-8 animate-fade-in-up animate-delay-100">
          <div className="flex items-center gap-3">
            {['Perfil', 'Artista'].map((label, i) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div style={{
                    width: 28, height: 28,
                    borderRadius: '50%',
                    background: i <= stepIndex ? '#0f0f0f' : 'transparent',
                    border: `1.5px solid ${i <= stepIndex ? '#0f0f0f' : '#ddd'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
                    fontSize: 11, fontWeight: 600,
                    color: i <= stepIndex ? '#fafafa' : '#ccc',
                  }}>
                    {i < stepIndex ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (i + 1)}
                  </div>
                  <span style={{ fontSize: 12, color: i <= stepIndex ? '#0f0f0f' : '#ccc', fontWeight: i === stepIndex ? 600 : 400, transition: 'all 0.3s ease' }}>
                    {label}
                  </span>
                </div>
                {i < 1 && (
                  <div style={{ width: 32, height: 1, background: stepIndex > i ? '#0f0f0f' : '#e5e5e5', transition: 'background 0.4s ease' }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 flex items-start justify-center px-6 pt-12 pb-16">
          <div className="w-full max-w-md">

            {/* STEP: PROFILE */}
            <div style={{
              opacity: transitioning || step !== 'profile' ? 0 : 1,
              transform: transitioning ? 'translateY(10px)' : 'translateY(0)',
              transition: 'opacity 0.28s ease, transform 0.28s ease',
              display: step === 'profile' ? 'block' : 'none',
            }}>
              <div className="mb-10">
                <h2 style={{ fontSize: '1.8rem', fontWeight: 200, color: '#0f0f0f', lineHeight: 1.2 }}>
                  Cuéntanos sobre ti
                </h2>
                <p style={{ marginTop: 6, fontSize: 14, color: '#aaa' }}>
                  Configura tu perfil personal
                </p>
              </div>

              <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                {/* Avatar upload */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <button
                    type="button"
                    onClick={() => profileInputRef.current?.click()}
                    style={{
                      width: 80, height: 80, borderRadius: '50%',
                      background: avatarPreview ? 'transparent' : '#f0f0f0',
                      border: '2px dashed #ddd',
                      cursor: 'pointer', overflow: 'hidden', flexShrink: 0,
                      transition: 'border-color 0.3s ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    className="hover:border-[#aaa]"
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    )}
                  </button>
                  <input ref={profileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarChange(e, 'profile')} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#0f0f0f' }}>Foto de perfil</p>
                    <p style={{ fontSize: 12, color: '#bbb', marginTop: 2 }}>JPG, PNG o WebP · Máx 5MB</p>
                  </div>
                </div>

                {/* Display name */}
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#aaa', marginBottom: 8 }}>
                    Nombre
                  </label>
                  <input
                    type="text"
                    placeholder="¿Cómo te llamamos?"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                {/* Bio */}
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#aaa', marginBottom: 8 }}>
                    Bio <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400, color: '#ccc' }}>· opcional</span>
                  </label>
                  <textarea
                    placeholder="Algo sobre ti..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    style={{
                      width: '100%', resize: 'none',
                      padding: '12px 0',
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: 15, fontWeight: 400,
                      color: '#0f0f0f', background: 'transparent',
                      border: 'none', borderBottom: '1.5px solid #e0e0e0',
                      transition: 'border-color 0.3s ease',
                      outline: 'none', lineHeight: 1.6,
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0f0f0f'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>

                {error && <p style={{ fontSize: 13, color: '#e53e3e', fontWeight: 500 }}>{error}</p>}

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando</>
                  ) : 'Continuar'}
                </button>
              </form>
            </div>

            {/* STEP: ARTIST */}
            <div style={{
              opacity: transitioning || step !== 'artist' ? 0 : 1,
              transform: transitioning ? 'translateY(10px)' : 'translateY(0)',
              transition: 'opacity 0.28s ease, transform 0.28s ease',
              display: step === 'artist' ? 'block' : 'none',
            }}>
              <div className="mb-10">
                <h2 style={{ fontSize: '1.8rem', fontWeight: 200, color: '#0f0f0f', lineHeight: 1.2 }}>
                  Tu proyecto artístico
                </h2>
                <p style={{ marginTop: 6, fontSize: 14, color: '#aaa' }}>
                  Crea tu primer perfil de artista
                </p>
              </div>

              <form onSubmit={handleArtistSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                {/* Artist avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <button
                    type="button"
                    onClick={() => artistInputRef.current?.click()}
                    style={{
                      width: 80, height: 80, borderRadius: 16,
                      background: artistAvatarPreview ? 'transparent' : '#f0f0f0',
                      border: '2px dashed #ddd',
                      cursor: 'pointer', overflow: 'hidden', flexShrink: 0,
                      transition: 'border-color 0.3s ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    className="hover:border-[#aaa]"
                  >
                    {artistAvatarPreview ? (
                      <img src={artistAvatarPreview} alt="artist" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                        <path d="M9 18V5l12-2v13" />
                        <circle cx="6" cy="18" r="3" />
                        <circle cx="18" cy="16" r="3" />
                      </svg>
                    )}
                  </button>
                  <input ref={artistInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleAvatarChange(e, 'artist')} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#0f0f0f' }}>Imagen del artista</p>
                    <p style={{ fontSize: 12, color: '#bbb', marginTop: 2 }}>Portada o logo · opcional</p>
                  </div>
                </div>

                {/* Artist name */}
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#aaa', marginBottom: 8 }}>
                    Nombre artístico
                  </label>
                  <input
                    type="text"
                    placeholder="El nombre con el que suenas"
                    value={artistName}
                    onChange={(e) => setArtistName(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                {/* Handle */}
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#aaa', marginBottom: 8 }}>
                    Handle <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400, color: '#ccc' }}>· opcional</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', color: '#ccc', fontSize: 15, paddingBottom: 2 }}>@</span>
                    <input
                      type="text"
                      placeholder="tu_handle"
                      value={artistHandle}
                      onChange={(e) => setArtistHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      className="input-field"
                      style={{ paddingLeft: 18 }}
                    />
                  </div>
                </div>

                {/* Artist bio */}
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#aaa', marginBottom: 8 }}>
                    Descripción <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400, color: '#ccc' }}>· opcional</span>
                  </label>
                  <textarea
                    placeholder="De qué va tu proyecto..."
                    value={artistBio}
                    onChange={(e) => setArtistBio(e.target.value)}
                    rows={3}
                    style={{
                      width: '100%', resize: 'none',
                      padding: '12px 0',
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: 15, color: '#0f0f0f',
                      background: 'transparent', border: 'none',
                      borderBottom: '1.5px solid #e0e0e0',
                      transition: 'border-color 0.3s ease',
                      outline: 'none', lineHeight: 1.6,
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0f0f0f'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>

                {error && <p style={{ fontSize: 13, color: '#e53e3e', fontWeight: 500 }}>{error}</p>}

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creando</>
                  ) : 'Crear artista y continuar'}
                </button>

                <div style={{ textAlign: 'center' }}>
                  <button type="button" onClick={skipArtist} className="link-hover" style={{ fontSize: 12 }}>
                    Ahora no, lo haré más tarde
                  </button>
                </div>
              </form>
            </div>

            {/* STEP: DONE */}
            <div style={{
              opacity: step === 'done' ? 1 : 0,
              transform: step === 'done' ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
              display: step === 'done' ? 'flex' : 'none',
              flexDirection: 'column', alignItems: 'center', gap: 20,
              textAlign: 'center', paddingTop: 40,
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: '#0f0f0f',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 200, color: '#0f0f0f' }}>
                Todo listo
              </h2>
              <p style={{ fontSize: 14, color: '#aaa' }}>
                Preparando tu espacio creativo...
              </p>
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
