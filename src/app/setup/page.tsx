'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { WaveBackground } from '@/components/ui/wave-background'
import { usePrefetchStore } from '@/stores/prefetch-store'

type Step = 'profile' | 'choice' | 'artist' | 'join' | 'done'

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

  const [mode, setMode] = useState<'create' | 'join' | null>(null)
  const [joinCode, setJoinCode] = useState('')
  const [joinLoading, setJoinLoading] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)
  const [savedAvatarPath, setSavedAvatarPath] = useState<string | null>(null)

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
        const timestamp = Date.now()
        const path = `user/${user.id}/avatar-${timestamp}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, avatarFile)
        if (uploadError) {
          console.error('Error subiendo avatar de perfil:', uploadError)
          setError(`Error al subir la imagen: ${uploadError.message}`)
          setLoading(false)
          return
        }
        avatarPath = path
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: displayName.trim(),
          avatar_path: avatarPath,
        })
      if (profileError) {
        console.error('Error guardando perfil:', profileError)
        setError(`Error al guardar el perfil: ${profileError.message}`)
        setLoading(false)
        return
      }

      setSavedAvatarPath(avatarPath)
      goTo('choice')
    } catch (err: unknown) {
      console.error('Error en handleProfileSubmit:', err)
      setError(err instanceof Error ? err.message : 'Ocurrió un error al guardar tu perfil')
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

      // 1. Insertar artista SIN avatar primero
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

      if (artistError) {
        console.error('❌ Error creando artista:', artistError)
        setError(`Error al crear el artista: ${artistError.message}`)
        setLoading(false)
        return
      }

      console.log('✅ Artista creado:', artistData)

      // 2. Esperar 500ms para que el trigger termine
      await new Promise(resolve => setTimeout(resolve, 500))

      // 3. Subir el avatar (si existe)
      if (artistAvatarFile && artistData) {
        const ext = artistAvatarFile.name.split('.').pop()
        const timestamp = Date.now()
        const path = `artist/${artistData.id}/avatar-${timestamp}.${ext}`
        
        console.log('📤 Subiendo a:', path)
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, artistAvatarFile)

        if (uploadError) {
          console.error('❌ Error upload:', uploadError)
          setError(`Artista creado pero fallo al subir imagen: ${uploadError.message}`)
          setLoading(false)
          return
        }

        console.log('✅ Upload exitoso. Path real:', uploadData.path)
        console.log('🔍 Comparación - esperado:', path, '| real:', uploadData.path)

        // 4. Guardar el path EXACTO que devolvió Supabase
        const { error: updateError } = await supabase
          .from('artists')
          .update({ avatar_path: uploadData.path }) // ← Usar uploadData.path
          .eq('id', artistData.id)

        if (updateError) {
          console.error('❌ Error actualizando DB:', updateError)
          setError(`Error al guardar el avatar: ${updateError.message}`)
          setLoading(false)
          return
        }

        console.log('✅ Avatar guardado en DB:', uploadData.path)
      }

      // 5. Marcar onboarding completado
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', user.id)

      goTo('done')
      
      // CAMBIO: Esperar 2 segundos para que el archivo se propague en storage
      usePrefetchStore.getState().invalidate()
      setTimeout(() => router.push('/home'), 2500) // ← Aumentar de 1800 a 2500ms
    } catch (err: unknown) {
      console.error('❌ Error general:', err)
      setError(err instanceof Error ? err.message : 'Ocurrió un error al crear el artista')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = joinCode.trim().toUpperCase()
    if (code.length < 6) { setJoinError('Introduce el código de 6 caracteres completo'); return }
    setJoinLoading(true)
    setJoinError(null)
    try {
      const { data: status, error } = await supabase.rpc('accept_artist_invite', {
        p_token: code,
        p_display_name: displayName.trim(),
        p_avatar_path: savedAvatarPath ?? '',
      })
      if (error) throw error
      const msgs: Record<string, string> = {
        invalid: 'Código incorrecto o no existe',
        used: 'Este código ya fue utilizado',
        expired: 'Este código ha caducado',
        not_authenticated: 'Debes iniciar sesión',
      }
      if (status === 'ok') {
        goTo('done')
        usePrefetchStore.getState().invalidate()
        setTimeout(() => router.push('/home'), 2000)
      } else {
        setJoinError(msgs[status as string] ?? `Error: ${status}`)
      }
    } catch (err: unknown) {
      setJoinError(err instanceof Error ? err.message : 'Error al unirte al equipo')
    } finally {
      setJoinLoading(false)
    }
  }

  const stepIndex = step === 'profile' ? 0 : step === 'done' ? 2 : 1
  const stepLabel2 = mode === 'join' ? 'Unirte' : 'Artista'

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
            {['Perfil', stepLabel2].map((label, i) => (
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

            {/* STEP: CHOICE */}
            <div style={{
              opacity: transitioning || step !== 'choice' ? 0 : 1,
              transform: transitioning ? 'translateY(10px)' : 'translateY(0)',
              transition: 'opacity 0.28s ease, transform 0.28s ease',
              display: step === 'choice' ? 'block' : 'none',
            }}>
              <div className="mb-10">
                <h2 style={{ fontSize: '1.8rem', fontWeight: 200, color: '#0f0f0f', lineHeight: 1.2 }}>
                  ¿Qué quieres hacer?
                </h2>
                <p style={{ marginTop: 6, fontSize: 14, color: '#aaa' }}>
                  Empieza creando tu proyecto o únete al de alguien
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => { setMode('create'); goTo('artist') }}
                  style={{ width: '100%', padding: '24px 20px', background: '#0f0f0f', color: '#fff', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'Outfit, sans-serif', display: 'flex', flexDirection: 'column', gap: 6 }}
                >
                  <span style={{ fontSize: 15, fontWeight: 500 }}>Crear mi artista</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>Configura tu proyecto artístico desde cero</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('join'); goTo('join') }}
                  style={{ width: '100%', padding: '24px 20px', background: '#fff', color: '#0f0f0f', border: '1.5px solid #e5e5e5', cursor: 'pointer', textAlign: 'left', fontFamily: 'Outfit, sans-serif', display: 'flex', flexDirection: 'column', gap: 6 }}
                >
                  <span style={{ fontSize: 15, fontWeight: 500 }}>Unirme a un artista</span>
                  <span style={{ fontSize: 12, color: '#bbb' }}>Tengo un código de invitación</span>
                </button>
              </div>
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
                  <button type="button" onClick={() => goTo('choice')} className="link-hover" style={{ fontSize: 12 }}>
                    Volver
                  </button>
                </div>
              </form>
            </div>

            {/* STEP: JOIN */}
            <div style={{
              opacity: transitioning || step !== 'join' ? 0 : 1,
              transform: transitioning ? 'translateY(10px)' : 'translateY(0)',
              transition: 'opacity 0.28s ease, transform 0.28s ease',
              display: step === 'join' ? 'block' : 'none',
            }}>
              <div className="mb-10">
                <h2 style={{ fontSize: '1.8rem', fontWeight: 200, color: '#0f0f0f', lineHeight: 1.2 }}>
                  Introduce el código
                </h2>
                <p style={{ marginTop: 6, fontSize: 14, color: '#aaa' }}>
                  Tu artista debe haberte pasado un código de 6 caracteres
                </p>
              </div>
              <form onSubmit={handleJoinSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#aaa', marginBottom: 16 }}>
                    Código de invitación
                  </label>
                  {/* 6-box OTP input */}
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <input
                        key={i} id={`join-box-${i}`} type="text" inputMode="text" maxLength={1}
                        value={joinCode[i] ?? ''}
                        autoFocus={i === 0}
                        onChange={e => {
                          const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                          if (!val) return
                          const arr = joinCode.padEnd(6, ' ').split('')
                          arr[i] = val[val.length - 1]
                          setJoinCode(arr.join('').trimEnd())
                          if (i < 5) document.getElementById(`join-box-${i + 1}`)?.focus()
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Backspace' && !joinCode[i] && i > 0)
                            document.getElementById(`join-box-${i - 1}`)?.focus()
                        }}
                        onPaste={i === 0 ? (e => {
                          e.preventDefault()
                          const text = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
                          setJoinCode(text)
                          document.getElementById(`join-box-${Math.min(text.length, 5)}`)?.focus()
                        }) : undefined}
                        style={{
                          width: 44, height: 52, textAlign: 'center', fontSize: 20, fontWeight: 500, fontFamily: 'inherit',
                          border: '1px solid #eee', background: '#fff', outline: 'none', caretColor: '#0f0f0f', transition: 'border-color .15s',
                        }}
                        onFocus={e => (e.target.style.borderColor = '#0f0f0f')}
                        onBlur={e => (e.target.style.borderColor = '#eee')}
                      />
                    ))}
                  </div>
                </div>
                {joinError && <p style={{ fontSize: 13, color: '#e53e3e', fontWeight: 500 }}>{joinError}</p>}
                <button type="submit" className="btn-primary" disabled={joinLoading || joinCode.replace(/[^A-Z0-9]/g, '').length < 6}>
                  {joinLoading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verificando...</>
                  ) : 'Unirme al equipo'}
                </button>
                <div style={{ textAlign: 'center' }}>
                  <button type="button" onClick={() => { setJoinError(null); goTo('choice') }} className="link-hover" style={{ fontSize: 12 }}>
                    Volver
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
