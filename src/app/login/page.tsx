'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { WaveBackground } from '@/components/ui/wave-background'
import { TypingText } from '@/components/ui/typing-text'

type Mode = 'login' | 'register'
type Step = 'form' | 'otp'

type CollapseProps = { open: boolean; children: React.ReactNode; delay?: string }

function Collapse({ open, children, delay = '0s' }: CollapseProps) {
  return (
    <div style={{
      display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', opacity: open ? 1 : 0,
      transition: `grid-template-rows 0.45s cubic-bezier(0.4,0,0.2,1) ${delay}, opacity 0.35s cubic-bezier(0.4,0,0.2,1) ${delay}`,
    }}>
      <div style={{ overflow: 'hidden' }}><div>{children}</div></div>
    </div>
  )
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
          onBlur={e => (e.target.style.borderColor = '#eee')}
        />
      ))}
    </div>
  )
}

function SearchParamsHandler({ setError }: { setError: (e: string) => void }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    const urlError = searchParams.get('error')
    if (code) { router.replace(`/auth/callback?code=${code}`); return }
    if (urlError) setError(decodeURIComponent(urlError))
  }, [searchParams, router, setError])

  return null
}

function LoginPageContent() {
  const [mode, setMode] = useState<Mode>('login')
  const [step, setStep] = useState<Step>('form')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [animating, setAnimating] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  const switchMode = (next: Mode) => {
    if (animating || mode === next) return
    setAnimating(true)
    setError(null); setSuccess(null); setStep('form'); setOtp('')
    setTimeout(() => { setMode(next); setAnimating(false) }, 300)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null); setSuccess(null)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false) }
      else {
        const pendingInvite = sessionStorage.getItem('pending_invite')
        if (pendingInvite) {
          sessionStorage.removeItem('pending_invite')
          await supabase.rpc('accept_artist_invite', { p_token: pendingInvite, p_display_name: '' })
        }
        router.push('/home')
      }
    } else {
      if (password !== confirmPassword) { setError('Las contraseñas no coinciden'); setLoading(false); return }

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      })

      if (otpError) {
        setError(otpError.status === 429 ? 'Demasiados intentos. Espera unos minutos.' : otpError.message)
        setLoading(false); return
      }

      setStep('otp')
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return
    setLoading(true); setError(null)

    const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' })

    if (error) { setError('Código incorrecto o expirado.'); setLoading(false); return }

    // Establecer contraseña y display_name en auth.users
    const { error: updateError } = await supabase.auth.updateUser({
      password,
      data: { display_name: name.trim() || 'Usuario' },
    })
    console.log('[otp] updateUser:', updateError ? updateError.message : 'OK')

    // Crear perfil
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').upsert({
        user_id: user.id,
        display_name: name.trim() || 'Usuario',
        onboarding_completed: false,
      }, { onConflict: 'user_id' })
    }

    router.push('/setup')
  }

  const isRegister = mode === 'register'

  if (step === 'otp') return (
    <div className="relative min-h-screen bg-[#fafafa]">
      <Suspense><SearchParamsHandler setError={(e) => setError(e)} /></Suspense>
      <WaveBackground />
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        <div className="max-w-sm w-full text-center flex flex-col items-center gap-6 animate-fade-in-up">
          <h1 style={{ fontSize: '1.6rem', fontWeight: 200, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#0f0f0f' }}>unreleased</h1>
          <div style={{ width: 40, height: 1, background: '#ddd' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 200, color: '#0f0f0f', letterSpacing: '-0.02em' }}>Verificar email</h2>
          <p style={{ fontSize: 13, color: '#aaa', lineHeight: 1.6 }}>Hemos enviado un código de 6 dígitos a</p>
          <p style={{ fontSize: 14, color: '#0f0f0f', fontWeight: 500 }}>{email}</p>

          <div style={{ marginTop: 8 }}>
            <OTPInput value={otp} onChange={setOtp} idPrefix="otp-login" />
          </div>

          {error && <p style={{ fontSize: 13, color: '#e53e3e', fontWeight: 500 }}>{error}</p>}

          <button onClick={handleVerifyOtp} className="btn-primary" disabled={loading || otp.length !== 6} style={{ width: '100%', marginTop: 8 }}>
            {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Verificando...</> : 'Verificar'}
          </button>

          <p style={{ fontSize: 11, color: '#ccc' }}>¿No lo recibes? Revisa la carpeta de spam.</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="relative min-h-screen bg-[#fafafa]">
      <Suspense><SearchParamsHandler setError={(e) => setError(e)} /></Suspense>
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
            <div className="hidden lg:flex flex-col gap-8 animate-fade-in-up animate-delay-100">
              <h2 style={{ fontSize: 'clamp(2.2rem, 4vw, 3.8rem)', fontWeight: 200, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#0f0f0f' }}>Tu música,<br />antes de que<br />vea la luz.</h2>
              <TypingText />
              <div className="flex gap-8 pt-2 animate-fade-in-up animate-delay-300">
                {['Álbumes', 'Stems', 'Versiones', 'Descargas'].map((f) => (
                  <span key={f} style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#bbb', transition: 'color 0.3s', cursor: 'default' }} className="hover:!text-[#0f0f0f]">{f}</span>
                ))}
              </div>
            </div>

            <div className="max-w-sm w-full mx-auto animate-fade-in-up animate-delay-200">
              <div className="lg:hidden mb-10 flex flex-col gap-4">
                <h2 style={{ fontSize: '1.6rem', fontWeight: 200, lineHeight: 1.2, color: '#0f0f0f' }}>Tu música, antes de<br />que vea la luz.</h2>
                <TypingText />
              </div>

              <div className="mb-8" style={{ opacity: animating ? 0 : 1, transform: animating ? 'translateY(6px)' : 'translateY(0)', transition: 'opacity 0.28s ease, transform 0.28s ease' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 300, color: '#0f0f0f' }}>{isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</h3>
                <p style={{ marginTop: 4, fontSize: 13, color: '#aaa' }}>{isRegister ? 'Empieza a gestionar tu música' : 'Accede a tu espacio creativo'}</p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <Collapse open={isRegister}>
                  <div style={{ paddingBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#aaa', marginBottom: 8 }}>Nombre</label>
                    <input type="text" placeholder="Tu nombre artístico" value={name} onChange={e => setName(e.target.value)} className="input-field" required={isRegister} tabIndex={isRegister ? 0 : -1} />
                  </div>
                </Collapse>
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#aaa', marginBottom: 8 }}>Email</label>
                  <input type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} className="input-field" required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#aaa', marginBottom: 8 }}>Contraseña</label>
                  <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="input-field" required />
                </div>
                <Collapse open={isRegister} delay="0.05s">
                  <div style={{ paddingBottom: 4 }}>
                    <label style={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#aaa', marginBottom: 8 }}>Confirmar contraseña</label>
                    <input type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input-field" required={isRegister} tabIndex={isRegister ? 0 : -1} />
                  </div>
                </Collapse>
                {error && <p className="animate-fade-in-up" style={{ fontSize: 13, color: '#e53e3e', fontWeight: 500 }}>{error}</p>}
                {success && <p className="animate-fade-in-up" style={{ fontSize: 13, color: '#38a169', fontWeight: 500 }}>{success}</p>}
                <button type="submit" className="btn-primary mt-2" disabled={loading}>
                  {loading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{isRegister ? 'Creando cuenta' : 'Accediendo'}</> : (isRegister ? 'Crear cuenta' : 'Entrar')}
                </button>
                <Collapse open={!isRegister}>
                  <div style={{ textAlign: 'center', paddingTop: 4 }}>
                    <button type="button" className="link-hover" style={{ fontSize: 12 }}>¿Olvidaste tu contraseña?</button>
                  </div>
                </Collapse>
              </form>

              <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #eee', textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: '#aaa' }}>
                  {isRegister ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
                  <button onClick={() => switchMode(isRegister ? 'login' : 'register')} style={{ color: '#0f0f0f', fontWeight: 600, fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                    {isRegister ? 'Inicia sesión' : 'Regístrate'}
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

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageContent />
    </Suspense>
  )
}
