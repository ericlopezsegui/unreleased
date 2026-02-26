'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { WaveBackground } from '@/components/ui/wave-background'

interface InviteInfo {
  artist_name: string
  role: string
  avatar_url: string
}

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState<'loading' | 'register' | 'accepting' | 'error' | 'success' | 'verify-email'>('loading')
  const [inviteInfo, setInviteInfo] = useState<InviteInfo | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    ;(async () => {
      const { data: info, error: infoErr } = await supabase.rpc('get_invite_info', { p_token: token })

      if (infoErr || !info?.[0]) {
        setErrorMsg('Enlace no válido o expirado.')
        setStep('error')
        return
      }

      const inv = info[0] as { artist_name: string; role: string; valid: boolean; reason: string; artist_avatar_path: string }

      if (!inv.valid) {
        setErrorMsg(inv.reason === 'used' ? 'Este enlace ya fue usado.' : inv.reason === 'expired' ? 'Este enlace ha expirado.' : 'Enlace no válido.')
        setStep('error')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setStep('accepting')
        const { data: result } = await supabase.rpc('accept_artist_invite', { p_token: token })
        if (result === 'ok') {
          setStep('success')
          setTimeout(() => router.push('/home'), 1500)
        } else {
          setErrorMsg('No se pudo unir al equipo.')
          setStep('error')
        }
        return
      }

      const path = inv.artist_avatar_path?.replace(/^\//, '') || ''
      const avatarUrl = path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${path}` : ''

      setInviteInfo({ artist_name: inv.artist_name, role: inv.role, avatar_url: avatarUrl })
      setStep('register')
    })()
  }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!name.trim()) { setFormError('Añade tu nombre.'); return }
    if (!email.trim()) { setFormError('Añade tu correo.'); return }
    if (password.length < 6) { setFormError('Mínimo 6 caracteres.'); return }
    if (password !== confirmPassword) { setFormError('Las contraseñas no coinciden.'); return }

    setSubmitting(true)

    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name.trim(), pending_invite_token: token },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (authErr || !authData.user) {
      setFormError(authErr?.status === 429 ? 'Demasiados intentos. Espera unos minutos.' : authErr?.message ?? 'Error al crear la cuenta.')
      setSubmitting(false)
      return
    }

    // NO intentar accept_artist_invite aquí — se hará en /auth/callback tras confirmar email
    setStep('verify-email')
  }

  const initials = inviteInfo?.artist_name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '?'

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

  if (step === 'verify-email') return (
    <div className="relative min-h-screen bg-[#fafafa]">
      <WaveBackground />
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        <div className="max-w-sm w-full text-center flex flex-col items-center gap-6 animate-fade-in-up">

          {inviteInfo?.avatar_url ? (
            <div style={{ width: 80, height: 80, background: '#f0f0f0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={inviteInfo.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : null}

          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 200, color: '#0f0f0f', marginBottom: 8, letterSpacing: '-0.02em' }}>
              Revisa tu correo
            </h2>
            <p style={{ fontSize: 13, color: '#aaa', lineHeight: 1.6 }}>
              Hemos enviado un enlace de confirmación a
            </p>
            <p style={{ fontSize: 14, color: '#0f0f0f', fontWeight: 500, marginTop: 6 }}>{email}</p>
          </div>

          <div style={{ width: 40, height: 1, background: '#eee' }} />

          <p style={{ fontSize: 12, color: '#bbb', lineHeight: 1.7, maxWidth: 300 }}>
            Confirma tu email para activar tu cuenta. Después podrás iniciar sesión y acceder a{' '}
            <strong style={{ color: '#0f0f0f', fontWeight: 500 }}>"{inviteInfo?.artist_name}"</strong>.
          </p>

          <button
            onClick={() => router.push('/login')}
            style={{
              marginTop: 12, padding: '11px 28px',
              background: '#0f0f0f', color: '#fff', border: 'none',
              cursor: 'pointer', fontSize: 13, fontWeight: 500,
              fontFamily: 'inherit', transition: 'opacity .15s',
            }}>
            Ir a iniciar sesión
          </button>

          <p style={{ fontSize: 11, color: '#ccc', marginTop: 4 }}>
            ¿No lo recibes? Revisa la carpeta de spam.
          </p>
        </div>
      </div>
    </div>
  )

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
                Te han invitado a colaborar como <span style={{ color: '#0f0f0f', fontWeight: 500 }}>{inviteInfo?.role === 'editor' ? 'editor' : 'colaborador'}</span>
              </p>
              <div className="flex gap-8 pt-2">
                {['Álbumes', 'Stems', 'Versiones', 'Descargas'].map(f => (
                  <span key={f} style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#bbb', cursor: 'default' }}>{f}</span>
                ))}
              </div>
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
                  Únete como <span style={{ color: '#0f0f0f', fontWeight: 500 }}>{inviteInfo?.role === 'editor' ? 'editor' : 'colaborador'}</span>
                </p>
              </div>

              <div className="mb-8">
                <h3 style={{ fontSize: '1.4rem', fontWeight: 300, color: '#0f0f0f' }}>Crear cuenta</h3>
                <p style={{ marginTop: 4, fontSize: 13, color: '#aaa' }}>
                  Crea tu cuenta para unirte a <strong style={{ fontWeight: 500, color: '#0f0f0f' }}>"{inviteInfo?.artist_name}"</strong>
                </p>
              </div>

              <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
                  {submitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creando cuenta...</> : 'Crear cuenta y unirse'}
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
