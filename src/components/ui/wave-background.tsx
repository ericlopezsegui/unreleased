'use client'

import { useEffect, useRef } from 'react'

interface Ripple {
  x: number
  y: number
  radius: number
  maxRadius: number
  startOpacity: number
  speed: number
  birth: number
}

export function WaveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ripplesRef = useRef<Ripple[]>([])
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)
  const spawnIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let w = 0
    let h = 0

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const spawnRipple = () => {
      // Límite máximo de ondas simultáneas
      if (ripplesRef.current.length >= 12) return
      ripplesRef.current.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: 0,
        maxRadius: 180 + Math.random() * 320,
        startOpacity: 0.15 + Math.random() * 0.12,
        speed: 18 + Math.random() * 14,
        birth: performance.now(),
      })
    }

    const startSpawning = () => {
      if (spawnIntervalRef.current) return
      spawnIntervalRef.current = setInterval(spawnRipple, 2000)
    }

    const stopSpawning = () => {
      if (spawnIntervalRef.current) {
        clearInterval(spawnIntervalRef.current)
        spawnIntervalRef.current = null
      }
    }

    // Pausar cuando la pestaña está en segundo plano
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopSpawning()
        cancelAnimationFrame(rafRef.current)
      } else {
        // Al volver, limpiar todas las ondas acumuladas y empezar de cero
        ripplesRef.current = []
        lastTimeRef.current = 0
        startSpawning()
        rafRef.current = requestAnimationFrame(draw)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Seed inicial
    for (let i = 0; i < 4; i++) {
      ripplesRef.current.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: Math.random() * 100,
        maxRadius: 180 + Math.random() * 320,
        startOpacity: 0.15 + Math.random() * 0.12,
        speed: 18 + Math.random() * 14,
        birth: performance.now() - Math.random() * 5000,
      })
    }
    startSpawning()

    const easeOut = (t: number) => 1 - (1 - t) * (1 - t) * (1 - t)

    const draw = (now: number) => {
      const dt = Math.min((now - (lastTimeRef.current || now)) / 1000, 0.05)
      lastTimeRef.current = now

      ctx.clearRect(0, 0, w, h)

      ripplesRef.current = ripplesRef.current.filter((r) => {
        r.radius += r.speed * dt
        const life = r.radius / r.maxRadius
        if (life >= 1) return false

        const fade = 1 - easeOut(life)
        const alpha = r.startOpacity * fade
        if (alpha < 0.003) return true

        ctx.beginPath()
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(0, 0, 0, ${alpha})`
        ctx.lineWidth = 2
        ctx.stroke()

        if (life > 0.04) {
          ctx.beginPath()
          ctx.arc(r.x, r.y, r.radius * 0.68, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(0, 0, 0, ${alpha * 0.55})`
          ctx.lineWidth = 1.4
          ctx.stroke()
        }

        if (life > 0.07 && life < 0.7) {
          ctx.beginPath()
          ctx.arc(r.x, r.y, r.radius * 0.38, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(0, 0, 0, ${alpha * 0.3})`
          ctx.lineWidth = 0.8
          ctx.stroke()
        }

        const grad = ctx.createRadialGradient(r.x, r.y, r.radius * 0.2, r.x, r.y, r.radius)
        grad.addColorStop(0, `rgba(0, 0, 0, ${alpha * 0.05})`)
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
        ctx.beginPath()
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        return true
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      stopSpawning()
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  )
}
