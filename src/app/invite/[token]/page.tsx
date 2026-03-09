'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { WaveBackground } from '@/components/ui/wave-background'
import { usePrefetchStore } from '@/stores/prefetch-store'

interface InviteInfo {
  artist_name: string
  role: string
  avatar_url: string
}

function OTPInput({ value, onChange, idPrefix = 'otp' }: { value: string; onChange: (v: string) => void; idPrefix?: string }) {
  const handleChange = (idx: number, char: string) => {
    if (char && !/^\d$/.test(char)) return
    const arr = value.padEnd(6, ' ').split('')
    arr[idx] = char || ' '
    const next = arr.join('').replace(/ /g, '')
    onChange(next)
    if (char && idx < 5) document.getElementById(`${idPrefix}-${idx + 1}`)?.focus()
  }
  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[idx] && idx > 0) document.getElementById(`${idPrefix}-${idx - 1}`)?.focus()
  }
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(text)
    document.getElementById(`${idPrefix}-${Math.min(text.length, 5)}`)?.focus()
  }
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input key={i} id={`${idPrefix}-${i}`} type="text" inputMode="numeric" maxLength={1}
          value={value[i] ?? ''} onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)} onPaste={i === 0 ? handlePaste : undefined}
          autoFocus={i === 0}
          style={{
            width: 44, height: 52, textAlign: 'center', fontSize: 20, fontWeight: 500, fontFamily: 'inherit',
            border: '1px solid #eee', background: '#fff', outline: 'none', caretColor: '#0f0f0f', transition: 'border-color .15s',
          }}
          onFocus={e => (e.target.style.borderColor = '#0f0f0f')}
          onBlur={e => (e.target.style.borderColor = '#eee')} />
      ))}
    </div>
  )
}

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter()
  const supabase = createClient()
  const fileRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<'loading' | 'register' | 'otp' | 'accepting' | 'error' | 'success'>('loading')
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [otp, setOtp] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    ;(async () => {
      const { data: info, error: infoErr } = await supabase.rpc('get_invite_info', { p_token: token })
      if (infoErr || !info?.[0]) { setErrorMsg('Enlace no válido o expirado.'); setStep('error'); return }

      const inv = info[0] as { artist_name: string; role: string; valid: boolean; reason: string; artist_avatar_path: string }
      if (!inv.valid) {
        setErrorMsg(inv.reason === 'used' ? 'Este enlace ya fue usado.' : inv.reason === 'expired' ? 'Este enlace ha expirado.' : 'Enlace no válido.')
        setStep('error'); return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setStep('accepting')
        const { data: result } = await supabase.rpc('accept_artist_invite', { p_token: token, p_display_name: '' })
        if (result === 'ok') { setStep('success'); usePrefetchStore.getState().invalidate(); setTimeout(() => router.push('/home'), 1500) }
        else { setErrorMsg('No se pudo unir al equipo.'); setStep('error') }
        return
      }

      const path = inv.artist_avatar_path?.replace(/^\//, '') || ''
      const avatarUrl = path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path}` : ''
      setInviteInfo({ artist_name: inv.artist_name, role: inv.role, avatar_url: avatarUrl })
      setStep('register')
    })()
  }, [])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!name.trim()) { setFormError('Añade tu nombre.'); return }
    if (!email.trim()) { setFormError('Añade tu correo.'); return }
    if (password.length < 6) { setFormError('Mínimo 6 caracteres.'); return }
    if (password !== confirmPassword) { setFormError('Las contraseñas no coinciden.'); return }

    setSubmitting(true)

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })

    if (otpError) {
      setFormError(otpError.status === 429 ? 'Demasiados intentos.' : otpError.message)
      setSubmitting(false); return
    }

    setStep('otp')
    setSubmitting(false)
  }

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return
    setSubmitting(true); setFormError('')

    const { error: otpErr } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' })
    if (otpErr) { setFormError('Código incorrecto o expirado.'); setSubmitting(false); return }

    await supabase.auth.updateUser({
      password,
      data: { display_name: name.trim() },
    })

    const { data: { user } } = await supabase.auth.getUser()

    // Subir avatar si hay
    let avatarPath = ''
    if (avatarFile && user) {
      const ext = avatarFile.name.split('.').pop()
      const filePath = `user/${user.id}/avatar-${Date.now()}.${ext}`
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true })
      console.log('[invite-otp] Upload:', uploadErr ? `ERROR: ${uploadErr.message}` : 'OK', filePath)
      if (!uploadErr) avatarPath = filePath
    }

    console.log('[invite-otp] avatarFile:', !!avatarFile, '| avatarPath:', avatarPath, '| user:', user?.id)

    // NO crear perfil aquí — accept_artist_invite lo hace
    setStep('accepting')
    const { data: result, error: rpcErr } = await supabase.rpc('accept_artist_invite', {
      p_token: token,
      p_display_name: name.trim(),
      p_avatar_path: avatarPath,
    })

    console.log('[invite-otp] RPC result:', result, '| error:', rpcErr?.message)

    // Verificar que se guardó
    if (user) {
      const { data: check } = await supabase.from('profiles').select('avatar_path, display_name').eq('user_id', user.id).single()
      console.log('[invite-otp] Profile check:', check)
    }

    if (result === 'ok') {
      setStep('success')
      usePrefetchStore.getState().invalidate()
      setTimeout(() => router.push('/home'), 1500)
    } else {
      setErrorMsg(`No se pudo unir al equipo. (${result ?? rpcErr?.message})`)
      setStep('error')
    }
  }

  const initials = inviteInfo?.artist_name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '?'

  /* Status screens */
  if (step === 'loading' || step === 'accepting') return (
    <div className="relative min-h-screen bg-[#fafafa]">
      <WaveBackground />
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center gap-3">
        <div className="w-4 h-4 border-2 border-[#eee] border-t-[#0f0f0f] rounded-full animate-spin" />
        <p style={{ fontSize: 13, color: '#aaa' }}>{step === 'loading' ? 'Verificando invitación...' : 'Uniéndote al equipo...'}</p>
      </div>
    </div>
  )

  if (step === 'success') return (
    <div className="relative min-h-screen bg-[#fafafa]">
      <WaveBackground />
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center gap-3">
        <p style={{ fontSize: 28 }}>✓</p>
        <p style={{ fontSize: 13, color: '#aaa' }}>¡Bienvenido al equipo!</p>
      </div>
    </div>
  )

  if (step === 'error') return (
    <div className="relative min-h-screen bg-[#fafafa]">
      <WaveBackground />
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center gap-3">
        <p style={{ fontSize: 28, color: '#ccc' }}>×</p>
        <p style={{ fontSize: 13, color: '#aaa' }}>{errorMsg}</p>
        <button onClick={() => router.push('/login')} style={{ background: 'none', border: '1px solid #eee', cursor: 'pointer', padding: '8px 20px', fontSize: 12, color: '#999', fontFamily: 'inherit', marginTop: 4 }}>Ir al inicio</button>
      </div>
    </div>
  )

  /* OTP screen */
  if (step === 'otp') return (
    <div className="relative min-h-screen bg-[#fafafa]">
      <WaveBackground />
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        <div className="max-w-sm w-full text-center flex flex-col items-center gap-6 animate-fade-in-up">
          {inviteInfo?.avatar_url && (
            <div style={{ width: 80, height: 80, background: '#f0f0f0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={inviteInfo.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          <h2 style={{ fontSize: '1.4rem', fontWeight: 200, color: '#0f0f0f', letterSpacing: '-0.02em' }}>Verificar email</h2>
          <p style={{ fontSize: 13, color: '#aaa', lineHeight: 1.6 }}>Hemos enviado un código de 6 dígitos a</p>
          <p style={{ fontSize: 14, color: '#0f0f0f', fontWeight: 500 }}>{email}</p>

          <div style={{ marginTop: 8 }}>
            <OTPInput value={otp} onChange={setOtp} idPrefix="otp-inv" />
          </div>

          {formError && <p style={{ fontSize: 13, color: '#e53e3e', fontWeight: 500 }}>{formError}</p>}

          <button onClick={handleVerifyOtp} className="btn-primary" disabled={submitting || otp.length !== 6} style={{ width: '100%' }}>
            {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verificando...</> : 'Verificar y unirse'}
          </button>

          <p style={{ fontSize: 12, color: '#bbb', maxWidth: 280, lineHeight: 1.6 }}>
            Al verificar, accederás a <strong style={{ color: '#0f0f0f', fontWeight: 500 }}>"{inviteInfo?.artist_name}"</strong>.
          </p>
          <p style={{ fontSize: 11, color: '#ccc' }}>¿No lo recibes? Revisa la carpeta de spam.</p>
        </div>
      </div>
    </div>
  )

  /* Register form */
  return (
    <div className="relative min-h-screen bg-[#fafafa]">
      <WaveBackground />
      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="w-full pt-12 pb-4 flex justify-center animate-fade-in-up">
          <div className="flex flex-col items-center gap-4">
            <h1 style={{ fontSize: '1.6rem', fontWeight: 200, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#0f0f0f' }}>unreleased</h1>
            <div style={{ width: 40, height: 1, background: '#ddd' }} />
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-6 pb-16">
          <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-20 items-center">

            {/* Left — Artist hero (desktop) */}
            <div className="hidden lg:flex flex-col items-center gap-6 animate-fade-in-up animate-delay-100">
              <div style={{ width: 200, height: 200, background: '#f0f0f0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {inviteInfo?.avatar_url ? (
                  <img src={inviteInfo.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                ) : (
                  <span style={{ fontSize: 48, fontWeight: 200, color: '#ccc', letterSpacing: '0.05em' }}>{initials}</span>
                )}
              </div>
              <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 200, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#0f0f0f', textAlign: 'center' }}>{inviteInfo?.artist_name}</h2>
              <p style={{ fontSize: 13, color: '#aaa', textAlign: 'center', maxWidth: 300, lineHeight: 1.6 }}>
                Te han invitado como <span style={{ color: '#0f0f0f', fontWeight: 500 }}>{inviteInfo?.role === 'editor' ? 'editor' : 'colaborador'}</span>
              </p>
            </div>

            {/* Right — Form */}
            <div className="max-w-sm w-full mx-auto animate-fade-in-up animate-delay-200">

              {/* Mobile artist preview */}
              <div className="lg:hidden mb-10 flex flex-col items-center gap-5">
                <div style={{ width: 140, height: 140, background: '#f0f0f0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {inviteInfo?.avatar_url ? (
                    <img src={inviteInfo.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  ) : (
                    <span style={{ fontSize: 36, fontWeight: 200, color: '#ccc' }}>{initials}</span>
                  )}
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 200, color: '#0f0f0f', textAlign: 'center' }}>{inviteInfo?.artist_name}</h2>
                <p style={{ fontSize: 13, color: '#aaa', textAlign: 'center', lineHeight: 1.6 }}>
                  Únete como <span style={{ color: '#0f0f0f', fontWeight: 500 }}>{inviteInfo?.role === 'editor' ? 'editor' : 'colaborador'}</span> de <span style={{ color: '#0f0f0f', fontWeight: 500 }}>"{inviteInfo?.artist_name}"</span>
                </p>
              </div>

              <div className="mb-8">
                <h3 style={{ fontSize: '1.4rem', fontWeight: 300, color: '#0f0f0f' }}>Crear cuenta</h3>
                <p style={{ marginTop: 4, fontSize: 13, color: '#aaa' }}>
                  Crea tu cuenta para unirte a <strong style={{ fontWeight: 500, color: '#0f0f0f' }}>"{inviteInfo?.artist_name}"</strong>
                </p>
              </div>

              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Avatar upload */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <button type="button" onClick={() => fileRef.current?.click()}
                    style={{ width: 72, height: 72, background: '#f0f0f0', border: '1px dashed #ddd', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '50%', transition: 'border-color .15s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#999')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#ddd')}>
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    )}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
                  <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#ccc' }}>Foto de perfil</span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#aaa', marginBottom: 8 }}>Nombre</label>
                  <input type="text" placeholder="Tu nombre" value={name} onChange={e => setName(e.target.value)} className="input-field" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#aaa', marginBottom: 8 }}>Email</label>
                  <input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="input-field" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#aaa', marginBottom: 8 }}>Contraseña</label>
                  <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="input-field" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#aaa', marginBottom: 8 }}>Confirmar contraseña</label>
                  <input type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input-field" required />
                </div>

                {formError && <p className="animate-fade-in-up" style={{ fontSize: 13, color: '#e53e3e', fontWeight: 500 }}>{formError}</p>}

                <button type="submit" className="btn-primary mt-2" disabled={submitting}>
                  {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creando cuenta...</> : 'Crear cuenta'}
                </button>
              </form>

              <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #eee', textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: '#aaa' }}>
                  ¿Ya tienes cuenta?{' '}
                  <button onClick={() => { sessionStorage.setItem('pending_invite', token); router.push('/login') }}
                    style={{ color: '#0f0f0f', fontWeight: 600, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                    Inicia sesión
                  </button>
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
