'use client'

import { useEffect, useRef, useState } from 'react'

const peaksCache = new Map<string, number[]>()
let decodeCtx: AudioContext | null = null

function getDecodeContext(): AudioContext {
  if (!decodeCtx || decodeCtx.state === 'closed') {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext
    decodeCtx = new Ctx()
  }
  return decodeCtx
}

export function PlayerWave({
  audioUrl,
  progress,
  onSeek,
  height = 42,
  mini = false,
}: {
  audioUrl: string | null
  progress: number
  onSeek: (progress: number) => void
  height?: number
  mini?: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [peaks, setPeaks] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    if (!audioUrl) {
      setPeaks([])
      setLoading(false)
      return
    }

    if (peaksCache.has(audioUrl)) {
      setPeaks(peaksCache.get(audioUrl)!)
      return
    }

    setLoading(true)

    ;(async () => {
      try {
        const res = await fetch(audioUrl)
        const buffer = await res.arrayBuffer()
        const ctx = getDecodeContext()
        const decoded = await ctx.decodeAudioData(buffer.slice(0))

        if (cancelled) return

        const data = decoded.getChannelData(0)
        const count = 220
        const block = Math.max(1, Math.floor(data.length / count))
        const values: number[] = []

        for (let i = 0; i < count; i++) {
          let max = 0
          const start = i * block
          const end = Math.min(start + block, data.length)
          for (let j = start; j < end; j++) {
            const v = Math.abs(data[j])
            if (v > max) max = v
          }
          values.push(max)
        }

        const maxPeak = Math.max(...values, 0.001)
        const normalized = values.map(v => v / maxPeak)

        peaksCache.set(audioUrl, normalized)
        if (!cancelled) setPeaks(normalized)
      } catch {
        if (!cancelled) setPeaks([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [audioUrl])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight
    if (!w || !h) return

    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, w, h)

    if (!peaks.length) return

    const bw = mini ? 2.5 : 2
    const gap = mini ? 2 : 1.5
    const step = bw + gap
    const visibleBars = Math.floor(w / step)
    const mid = h / 2
    const playedX = progress * w

    for (let i = 0; i < visibleBars; i++) {
      const x = i * step
      const peakIndex = Math.floor((i / Math.max(visibleBars, 1)) * peaks.length)
      const amp = peaks[peakIndex] ?? 0
      const bh = Math.max(2, amp * (h - 6))
      const y = mid - bh / 2

      ctx.fillStyle = x < playedX ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.16)'
      ctx.fillRect(x, y, bw, bh)
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.58)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(playedX, 3)
    ctx.lineTo(playedX, h - 3)
    ctx.stroke()
  }, [peaks, progress, mini])

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.35)',
            fontSize: 11,
          }}
        >
          Cargando…
        </div>
      )}
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block', cursor: 'pointer' }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const p = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
          onSeek(p)
        }}
      />
    </div>
  )
}