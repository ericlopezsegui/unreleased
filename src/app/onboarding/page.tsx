'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { WaveBackground } from '@/components/ui/wave-background'

const slides = [
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
    tag: 'Tu música',
    title: 'Todo tu trabajo,\nen un solo lugar.',
    description: 'Sube tus canciones, organízalas por álbum y accede a ellas desde cualquier dispositivo. Tu música siempre contigo, siempre privada.',
    detail: ['Álbumes ilimitados', 'Organización total', 'Acceso multiplataforma'],
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    tag: 'Versiones',
    title: 'Cada canción\ntiene su historia.',
    description: 'Guarda múltiples versiones de cada track. Compara, elige y marca la versión definitiva. Nunca pierdas una idea.',
    detail: ['Versiones ilimitadas', 'Versión activa marcada', 'Notas por versión'],
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    tag: 'Stems',
    title: 'Separa,\najusta, controla.',
    description: 'Gestiona los stems de cada canción: vocals, drums, bass, instrumentales. Todo organizado y listo para exportar.',
    detail: ['Vocals · Drums · Bass', 'Instrumentales · FX', 'Exportación individual'],
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
    tag: 'Compartir',
    title: 'Comparte solo\ncon quien quieras.',
    description: 'Genera enlaces privados para álbumes, tracks o versiones específicas. Con o sin descarga, con o sin fecha de expiración.',
    detail: ['Links privados', 'Control de descargas', 'Expiración configurable'],
  },
  {
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    tag: 'Colaboración',
    title: 'Tu equipo,\ntu proyecto.',
    description: 'Invita a colaboradores a tus proyectos artísticos con roles diferenciados: owner, editor o viewer. Trabaja en equipo sin perder el control.',
    detail: ['Roles definidos', 'Múltiples artistas', 'Control de acceso'],
  },
]

export default function OnboardingPage() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  const [animating, setAnimating] = useState(false)
  const [visible, setVisible] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Auto-advance cada 6 segundos
  useEffect(() => {
    const t = setTimeout(() => {
      if (current < slides.length - 1) goTo(current + 1, 'next')
    }, 6000)
    return () => clearTimeout(t)
  }, [current])

  const goTo = (index: number, dir: 'next' | 'prev') => {
    if (animating || index === current) return
    setDirection(dir)
    setAnimating(true)
    setVisible(false)
    setTimeout(() => {
      setCurrent(index)
      setVisible(true)
      setAnimating(false)
    }, 350)
  }

  const handleNext = () => {
    if (current < slides.length - 1) goTo(current + 1, 'next')
    else handleFinish()
  }

  const handlePrev = () => {
    if (current > 0) goTo(current - 1, 'prev')
  }

  const handleFinish = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('profiles').upsert({
        user_id: user.id,
        onboarding_completed: true,
      })
    }
    router.push('/home')
  }

  const slide = slides[current]
  const isLast = current === slides.length - 1

  const slideStyle = {
    opacity: visible ? 1 : 0,
    transform: visible
      ? 'translateY(0) scale(1)'
      : direction === 'next'
        ? 'translateY(18px) scale(0.98)'
        : 'translateY(-18px) scale(0.98)',
    transition: 'opacity 0.4s cubic-bezier(0.4,0,0.2,1), transform 0.4s cubic-bezier(0.4,0,0.2,1)',
  }

  return (
    <div className="relative min-h-screen bg-[#fafafa]">
      <WaveBackground />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="w-full pt-10 flex justify-between items-center px-8 md:px-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0f0f0f] flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </div>
            <span style={{ fontSize: '1rem', fontWeight: 200, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#0f0f0f' }}>
              unreleased
            </span>
          </div>

          <button
            onClick={handleFinish}
            style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.1em', color: '#bbb', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.3s' }}
            className="hover:!text-[#0f0f0f] link-hover"
          >
            Saltar
          </button>
        </header>

        {/* Main content */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <div className="w-full max-w-2xl flex flex-col items-center text-center gap-10">

            {/* Slide content */}
            <div style={slideStyle} className="flex flex-col items-center gap-8 w-full">

              {/* Icon */}
              <div style={{
                width: 80, height: 80,
                borderRadius: 24,
                background: '#0f0f0f',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white',
              }}>
                {slide.icon}
              </div>

              {/* Tag */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                marginBottom: -16,
              }}>
                <div style={{ width: 20, height: 1, background: '#ccc' }} />
                <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#bbb' }}>
                  {slide.tag}
                </span>
                <div style={{ width: 20, height: 1, background: '#ccc' }} />
              </div>

              {/* Title */}
              <h1 style={{
                fontSize: 'clamp(2rem, 5vw, 3.2rem)',
                fontWeight: 200,
                lineHeight: 1.12,
                letterSpacing: '-0.02em',
                color: '#0f0f0f',
                whiteSpace: 'pre-line',
              }}>
                {slide.title}
              </h1>

              {/* Description */}
              <p style={{
                fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
                color: '#888',
                fontWeight: 300,
                lineHeight: 1.7,
                maxWidth: 480,
              }}>
                {slide.description}
              </p>

              {/* Detail pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                {slide.detail.map((d) => (
                  <span key={d} style={{
                    padding: '6px 16px',
                    borderRadius: 99,
                    border: '1px solid #e5e5e5',
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#999',
                    background: 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(8px)',
                  }}>
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* Progress + Navigation */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, width: '100%' }}>
              {/* Dots */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i, i > current ? 'next' : 'prev')}
                    style={{
                      width: i === current ? 28 : 6,
                      height: 6,
                      borderRadius: 99,
                      background: i === current ? '#0f0f0f' : '#ddd',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
                    }}
                  />
                ))}
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {current > 0 && (
                  <button
                    onClick={handlePrev}
                    style={{
                      padding: '12px 24px',
                      fontSize: 13, fontWeight: 500,
                      letterSpacing: '0.08em',
                      color: '#999',
                      background: 'none',
                      border: '1.5px solid #e5e5e5',
                      borderRadius: 0,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    className="hover:border-[#aaa] hover:!text-[#0f0f0f]"
                  >
                    Anterior
                  </button>
                )}

                <button
                  onClick={handleNext}
                  className="btn-primary"
                  style={{ width: 'auto', padding: '12px 32px', borderRadius: 0, fontSize: 13, letterSpacing: '0.12em' }}
                >
                  {isLast ? 'Empezar' : 'Siguiente'}
                </button>
              </div>

              {/* Counter */}
              <p style={{ fontSize: 11, color: '#ccc', letterSpacing: '0.1em' }}>
                {current + 1} / {slides.length}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
