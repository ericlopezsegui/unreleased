'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { usePlayerStore } from '@/stores/player-store'

type Tab = 'versions' | 'controls' | 'eq' | 'stems'

function Ic({ d, s = 16, c = 'currentColor', w = 1.5 }: { d: string | string[]; s?: number; c?: string; w?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      {(Array.isArray(d) ? d : [d]).map((p, i) => <path key={i} d={p} />)}
    </svg>
  )
}

function fmt(s: number) {
  if (!s || isNaN(s) || !isFinite(s)) return '0:00'
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

/* Circular-arrow skip button icon with number label */
function SkipIcon({ dir }: { dir: 'back' | 'fwd' }) {
  return (
    <svg width={28} height={28} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      {dir === 'back' ? (
        // counterclockwise arc, arrowhead at top-left
        <>
          <path d="M14 4a10 10 0 1 0 7.07 2.93" />
          <polyline points="9,4 14,4 14,9" />
        </>
      ) : (
        // clockwise arc, arrowhead at top-right
        <>
          <path d="M14 4a10 10 0 1 1-7.07 2.93" />
          <polyline points="19,4 14,4 14,9" />
        </>
      )}
      <text x="14" y="19.5" textAnchor="middle" fontSize="7" fontWeight="700"
        fill="currentColor" stroke="none" fontFamily="Outfit,sans-serif" letterSpacing="-0.5">15</text>
    </svg>
  )
}

/* ── Module-level peaks cache ────────────────────────────────────── */
const peaksCache = new Map<string, number[]>()

/* ─────────────────────────────────────────────────────────────────
   WaveCanvas
   • mini=false  → full static waveform (expanded panel), click to seek
   • mini=true   → scrolling window around playhead (mini bar)
                   the visible window is always centred on the
                   current position, bars scroll smoothly
───────────────────────────────────────────────────────────────── */
function WaveCanvas({
  audioUrl,
  progress,
  onSeek,
  height = 40,
  mini = false,
}: {
  audioUrl: string | null
  progress: number   // 0–1
  onSeek: (p: number) => void
  height?: number
  mini?: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [peaks, setPeaks] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  // animated scroll offset for mini mode (in peak-index units, float)
  const scrollRef = useRef(0)
  const rafRef = useRef<number>(0)
  // scrub drag state (non-mini only)
  const draggingRef = useRef(false)
  const [scrubProgress, setScrubProgress] = useState<number | null>(null)
  // mini swipe drag state
  const miniDragRef = useRef<{ active: boolean; startX: number; startProgress: number }>({ active: false, startX: 0, startProgress: 0 })

  /* decode peaks once */
  useEffect(() => {
    if (!audioUrl) return
    if (peaksCache.has(audioUrl)) { setPeaks(peaksCache.get(audioUrl)!); return }
    setLoading(true)
    ;(async () => {
      try {
        const resp = await fetch(audioUrl)
        const buf = await resp.arrayBuffer()
        const actx = new (window.AudioContext || (window as any).webkitAudioContext)()
        const decoded = await actx.decodeAudioData(buf)
        actx.close()
        const data = decoded.getChannelData(0)
        const N = 300
        const block = Math.floor(data.length / N)
        const pts: number[] = []
        for (let i = 0; i < N; i++) {
          let max = 0
          for (let j = 0; j < block; j++) { const v = Math.abs(data[i * block + j]); if (v > max) max = v }
          pts.push(max)
        }
        const mx = Math.max(...pts, 0.001)
        const norm = pts.map(p => p / mx)
        peaksCache.set(audioUrl, norm)
        setPeaks(norm)
      } catch { /* silent */ }
      setLoading(false)
    })()
  }, [audioUrl])

  /* draw full waveform (expanded) — accepts explicit prog so scrub preview works */
  const drawFull = useCallback((canvas: HTMLCanvasElement, prog: number) => {
    if (peaks.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    const w = canvas.offsetWidth, h = canvas.offsetHeight
    if (w === 0 || h === 0) return
    canvas.width = w * dpr; canvas.height = h * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, w, h)
    const bw = 2, gap = 1.5, step = bw + gap
    const count = Math.floor(w / step)
    const mid = h / 2
    const progX = prog * w
    for (let i = 0; i < count; i++) {
      const x = i * step
      const pi = Math.floor((i / count) * peaks.length)
      const amp = peaks[pi] ?? 0
      const bh = Math.max(2, amp * (h - 6))
      // active bar gets a slightly brighter tint right at the scrub head
      const isFront = x <= progX && x + bw > progX
      ctx.fillStyle = x < progX
        ? (isFront ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.88)')
        : 'rgba(255,255,255,0.16)'
      const y = mid - bh / 2, r = 1
      ctx.beginPath()
      ctx.moveTo(x + r, y); ctx.lineTo(x + bw - r, y)
      ctx.arcTo(x + bw, y, x + bw, y + r, r); ctx.lineTo(x + bw, y + bh - r)
      ctx.arcTo(x + bw, y + bh, x + bw - r, y + bh, r); ctx.lineTo(x + r, y + bh)
      ctx.arcTo(x, y + bh, x, y + bh - r, r); ctx.lineTo(x, y + r)
      ctx.arcTo(x, y, x + r, y, r)
      ctx.fill()
    }
    // thin playhead needle
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(progX, 3); ctx.lineTo(progX, h - 3); ctx.stroke()
  }, [peaks])

  /* draw scrolling mini waveform */
  const drawMini = useCallback((canvas: HTMLCanvasElement) => {
    if (peaks.length === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    const w = canvas.offsetWidth, h = canvas.offsetHeight
    if (w === 0 || h === 0) return
    canvas.width = w * dpr; canvas.height = h * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, w, h)

    const bw = 2.5, gap = 2, step = bw + gap
    const visCount = Math.floor(w / step)          // how many bars fit
    // scrollRef.current = floating peak-index of leftmost visible bar
    const leftPeak = scrollRef.current             // may be fractional
    // playhead is always painted at the physical centre of the strip
    const playheadX = w / 2
    // which peak index corresponds to "now"
    const playedUpTo = progress * peaks.length

    // fade mask — left and right edges fade out
    const fadeW = w * 0.18
    const grad = ctx.createLinearGradient(0, 0, w, 0)
    grad.addColorStop(0, 'rgba(0,0,0,0)')
    grad.addColorStop(fadeW / w, 'rgba(0,0,0,1)')
    grad.addColorStop(1 - fadeW / w, 'rgba(0,0,0,1)')
    grad.addColorStop(1, 'rgba(0,0,0,0)')

    for (let i = 0; i < visCount + 2; i++) {
      const peakIdx = leftPeak + i
      if (peakIdx < 0 || peakIdx >= peaks.length) continue
      const pi = Math.floor(peakIdx)
      const amp = peaks[pi] ?? 0
      const bh = Math.max(2, amp * (h - 4))
      const x = i * step - (leftPeak % 1) * step   // sub-pixel scroll
      const mid = h / 2, y = mid - bh / 2, r = 1

      // bars whose peak index is before the playhead = played (bright)
      const isPlayed = peakIdx < playedUpTo
      ctx.fillStyle = isPlayed ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.18)'
      ctx.beginPath()
      ctx.moveTo(x + r, y); ctx.lineTo(x + bw - r, y)
      ctx.arcTo(x + bw, y, x + bw, y + r, r); ctx.lineTo(x + bw, y + bh - r)
      ctx.arcTo(x + bw, y + bh, x + bw - r, y + bh, r); ctx.lineTo(x + r, y + bh)
      ctx.arcTo(x, y + bh, x, y + bh - r, r); ctx.lineTo(x, y + r)
      ctx.arcTo(x, y, x + r, y, r)
      ctx.fill()
    }

    // playhead line — always at centre
    ctx.strokeStyle = 'rgba(255,255,255,0.65)'
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(playheadX, 3); ctx.lineTo(playheadX, h - 3); ctx.stroke()

    // apply fade mask via destination-in composite
    ctx.globalCompositeOperation = 'destination-in'
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, w, h)
    ctx.globalCompositeOperation = 'source-over'
  }, [peaks, progress])

  /* animated scroll loop for mini mode */
  useEffect(() => {
    if (!mini || peaks.length === 0) return
    const canvas = canvasRef.current
    if (!canvas) return

    let running = true
    const step = 2.5 + 2   // bar step in px

    const tick = () => {
      if (!running) return
      const w = canvas.offsetWidth
      if (w === 0) { rafRef.current = requestAnimationFrame(tick); return }
      const visCount = Math.floor(w / step)
      // target: playhead sits at centre
      const targetLeft = progress * peaks.length - visCount / 2
      // smooth lerp so the scroll glides, not jumps
      const cur = scrollRef.current
      const delta = targetLeft - cur
      // teleport if very far (e.g. user seeked), else lerp
      scrollRef.current = Math.abs(delta) > visCount * 0.8
        ? targetLeft
        : cur + delta * 0.08
      drawMini(canvas)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { running = false; cancelAnimationFrame(rafRef.current) }
  }, [mini, peaks, progress, drawMini])

  /* full waveform draw (non-mini) — uses scrubProgress override when dragging */
  const draw = useCallback(() => {
    if (mini) return
    const canvas = canvasRef.current
    if (!canvas) return
    const prog = scrubProgress !== null ? scrubProgress : progress
    drawFull(canvas, prog)
  }, [mini, drawFull, progress, scrubProgress])

  useEffect(() => { draw() }, [draw])

  /* resize observer */
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ro = new ResizeObserver(() => {
      if (!mini) {
        const prog = scrubProgress !== null ? scrubProgress : progress
        drawFull(canvas, prog)
      }
    })
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [mini, drawFull, progress, scrubProgress])

  // position-based seek: maps tap position to timeline (used for non-mini scrub and mini tap)
  const getPosFromTap = (clientX: number, rect: DOMRect): number => {
    if (mini) {
      const canvas = canvasRef.current
      if (!canvas || peaks.length === 0) return progress
      const w = canvas.offsetWidth
      const visCount = Math.floor(w / (2.5 + 2))
      const leftPeak = scrollRef.current
      const rel = (clientX - rect.left) / rect.width
      const tappedPeakIdx = leftPeak + rel * visCount
      return Math.max(0, Math.min(1, tappedPeakIdx / peaks.length))
    } else {
      return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    }
  }

  const handlePointerDown = (clientX: number, rect: DOMRect) => {
    if (mini) {
      miniDragRef.current = { active: true, startX: clientX, startProgress: progress }
      return
    }
    draggingRef.current = true
    const p = getPosFromTap(clientX, rect)
    setScrubProgress(p)
    onSeek(p)
  }

  const handlePointerMove = (clientX: number, rect: DOMRect) => {
    if (mini) {
      if (!miniDragRef.current.active) return
      const canvas = canvasRef.current
      if (!canvas || peaks.length === 0) return
      const w = canvas.offsetWidth
      const visCount = Math.floor(w / (2.5 + 2))
      const deltaX = clientX - miniDragRef.current.startX
      // natural-scroll: drag left (−deltaX) → forward in time (+progress)
      const deltaPeaks = -(deltaX / w) * visCount
      const newProgress = Math.max(0, Math.min(1, miniDragRef.current.startProgress + deltaPeaks / peaks.length))
      onSeek(newProgress)
      return
    }
    if (!draggingRef.current) return
    const p = getPosFromTap(clientX, rect)
    setScrubProgress(p)
    onSeek(p)
  }

  const handlePointerUp = (clientX: number, rect: DOMRect) => {
    if (mini) {
      if (!miniDragRef.current.active) return
      const deltaX = Math.abs(clientX - miniDragRef.current.startX)
      // small movement = tap → position-based seek
      if (deltaX < 6) onSeek(getPosFromTap(clientX, rect))
      miniDragRef.current.active = false
      return
    }
    if (!draggingRef.current) return
    draggingRef.current = false
    const p = getPosFromTap(clientX, rect)
    setScrubProgress(null)
    onSeek(p)
  }

  return (
    <div style={{ position: 'relative', height, width: '100%', overflow: 'hidden' }}>
      {loading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ width: 10, height: 10, border: '1.5px solid rgba(255,255,255,0.08)', borderTopColor: 'rgba(255,255,255,0.55)', borderRadius: '50%', display: 'inline-block', animation: 'dp-spin .7s linear infinite' }} />
        </div>
      )}
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%', cursor: mini ? 'pointer' : 'crosshair', opacity: loading ? 0 : 1, transition: 'opacity .3s', touchAction: 'none', userSelect: 'none' }}
        onMouseDown={e => handlePointerDown(e.clientX, e.currentTarget.getBoundingClientRect())}
        onMouseMove={e => handlePointerMove(e.clientX, e.currentTarget.getBoundingClientRect())}
        onMouseUp={e => handlePointerUp(e.clientX, e.currentTarget.getBoundingClientRect())}
        onMouseLeave={() => { if (draggingRef.current) { draggingRef.current = false; setScrubProgress(null) } }}
        onTouchStart={e => { e.preventDefault(); const t = e.touches[0]; handlePointerDown(t.clientX, e.currentTarget.getBoundingClientRect()) }}
        onTouchMove={e => { e.preventDefault(); const t = e.touches[0]; handlePointerMove(t.clientX, e.currentTarget.getBoundingClientRect()) }}
        onTouchEnd={e => { e.preventDefault(); const t = e.changedTouches[0]; handlePointerUp(t.clientX, e.currentTarget.getBoundingClientRect()) }}
      />
    </div>
  )
}

/* ── CSS ─────────────────────────────────────────────────────────── */
const CSS = `
  .dp-range { -webkit-appearance:none; appearance:none; width:100%; height:6px; border-radius:6px; outline:none; cursor:pointer; touch-action:none; }
  .dp-range::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; width:24px; height:24px; border-radius:50%; background:#fff; cursor:grab; border:none; box-shadow:0 1px 8px rgba(0,0,0,0.5); }
  .dp-range::-webkit-slider-thumb:active { cursor:grabbing; transform:scale(1.15); }
  .dp-range::-moz-range-thumb { width:24px; height:24px; border-radius:50%; background:#fff; cursor:grab; border:none; box-shadow:0 1px 8px rgba(0,0,0,0.5); }
  .dp-iBtn { background:none; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center;
    flex-shrink:0; color:rgba(255,255,255,0.38); transition:color .14s; padding:0;
    min-width:44px; min-height:44px; }
  .dp-iBtn:hover { color:rgba(255,255,255,0.88); }
  .dp-iBtn:active { color:#fff; }
  .dp-iBtn.sm { min-width:36px; min-height:36px; }
  .dp-play { border-radius:50%; background:#fff; border:none; cursor:pointer;
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
    transition:transform .13s, box-shadow .15s; }
  .dp-play:hover { transform:scale(1.07); }
  .dp-play:active { transform:scale(0.91); }
  .dp-tab { background:none; border:none; cursor:pointer; font-family:Outfit,sans-serif;
    font-size:12px; font-weight:500; padding:10px 14px; transition:color .15s;
    white-space:nowrap; min-height:44px; }
  .dp-tab.on { color:#fff; }
  .dp-tab:not(.on) { color:rgba(255,255,255,0.3); }
  .dp-sec { font-size:9px; font-weight:700; letter-spacing:.18em; text-transform:uppercase;
    color:rgba(255,255,255,0.28); margin:0 0 14px; }
  @keyframes dp-spin { to { transform:rotate(360deg) } }
  @keyframes dp-fadein { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:translateY(0) } }
  .dp-panel-enter { animation: dp-fadein .22s ease both; }
`

/* ── Player ──────────────────────────────────────────────────────── */
export function Player() {
  const {
    isOpen, isExpanded, isPlaying,
    trackTitle, coverUrl, versions, currentVersionId,
    queue, queueIndex,
    close, toggleExpanded, setPlaying, setCurrentVersion, nextTrack, prevTrack,
  } = usePlayerStore()

  const audioRef = useRef<HTMLAudioElement>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const bassRef = useRef<BiquadFilterNode | null>(null)
  const midRef = useRef<BiquadFilterNode | null>(null)
  const trebleRef = useRef<BiquadFilterNode | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [appear, setAppear] = useState(false)
  const [panelVisible, setPanelVisible] = useState(false)
  const [tab, setTab] = useState<Tab>('versions')
  const [rate, setRateState] = useState(1)
  const [pitch, setPitchState] = useState(0)
  const [eqBass, setEqBass] = useState(0)
  const [eqMid, setEqMid] = useState(0)
  const [eqTreble, setEqTreble] = useState(0)
  // true after EQ graph is wired up
  const [eqActive, setEqActive] = useState(false)

  const currentVer = versions.find(v => v.id === currentVersionId)
  const audioUrl = currentVer?.audioUrl ?? null
  const progress = duration > 0 ? currentTime / duration : 0
  const remaining = Math.max(duration - currentTime, 0)

  /* entrance slide-up */
  useEffect(() => {
    if (isOpen) requestAnimationFrame(() => requestAnimationFrame(() => setAppear(true)))
    else setAppear(false)
  }, [isOpen])

  /* panel expand/collapse with slight delay so CSS transition starts */
  useEffect(() => {
    if (isExpanded) {
      requestAnimationFrame(() => requestAnimationFrame(() => setPanelVisible(true)))
    } else {
      setPanelVisible(false)
    }
  }, [isExpanded])

  /* ── Activate EQ ──
     Called from a real user-gesture handler (button click).
     Creates AudioContext + BiquadFilters and wires them into the <audio>
     element. Once done, audio routes: element → bass → mid → treble → speakers.
     Before activation, audio goes straight to speakers (no Web Audio). */
  const activateEq = useCallback(() => {
    const a = audioRef.current
    if (!a || audioCtxRef.current) return
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    audioCtxRef.current = ctx
    const src = ctx.createMediaElementSource(a)
    const bass = ctx.createBiquadFilter()
    bass.type = 'lowshelf'; bass.frequency.value = 200; bass.gain.value = eqBass
    bassRef.current = bass
    const mid = ctx.createBiquadFilter()
    mid.type = 'peaking'; mid.frequency.value = 1000; mid.Q.value = 1; mid.gain.value = eqMid
    midRef.current = mid
    const treble = ctx.createBiquadFilter()
    treble.type = 'highshelf'; treble.frequency.value = 8000; treble.gain.value = eqTreble
    trebleRef.current = treble
    src.connect(bass).connect(mid).connect(treble).connect(ctx.destination)
    if (ctx.state === 'suspended') ctx.resume()
    setEqActive(true)
  }, [eqBass, eqMid, eqTreble])

  /* ── Play / Pause sync ── */
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    if (isPlaying) {
      if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume()
      a.play().catch(() => setPlaying(false))
    } else {
      a.pause()
    }
  }, [isPlaying])

  /* ── Rate + Pitch ── */
  useEffect(() => {
    const a = audioRef.current
    if (!a) return
    if (pitch !== 0) {
      a.preservesPitch = false
      ;(a as any).mozPreservesPitch = false
      ;(a as any).webkitPreservesPitch = false
      a.playbackRate = rate * Math.pow(2, pitch / 12)
    } else {
      a.preservesPitch = true
      ;(a as any).mozPreservesPitch = true
      ;(a as any).webkitPreservesPitch = true
      a.playbackRate = rate
    }
  }, [rate, pitch])

  /* ── EQ gain updates (only if graph exists) ── */
  useEffect(() => { if (bassRef.current) bassRef.current.gain.value = eqBass }, [eqBass])
  useEffect(() => { if (midRef.current) midRef.current.gain.value = eqMid }, [eqMid])
  useEffect(() => { if (trebleRef.current) trebleRef.current.gain.value = eqTreble }, [eqTreble])

  const seek = (p: number) => {
    const a = audioRef.current
    if (!a || !duration) return
    a.currentTime = p * duration
    setCurrentTime(a.currentTime)
  }

  if (!isOpen) return null

  const TABS: { id: Tab; label: string }[] = [
    { id: 'versions', label: 'Versiones' },
    { id: 'controls', label: 'Controles' },
    { id: 'eq', label: 'EQ' },
    { id: 'stems', label: 'Stems' },
  ]

  return (
    <>
      <style>{CSS}</style>

      {/* hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl ?? undefined}
        crossOrigin="anonymous"
        onTimeUpdate={() => { if (audioRef.current) setCurrentTime(audioRef.current.currentTime) }}
        onLoadedMetadata={() => {
          const a = audioRef.current
          if (!a) return
          setDuration(a.duration)
          if (pitch !== 0) {
            a.preservesPitch = false
            ;(a as any).mozPreservesPitch = false
            ;(a as any).webkitPreservesPitch = false
            a.playbackRate = rate * Math.pow(2, pitch / 12)
          } else {
            a.playbackRate = rate
          }
          if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume()
          a.play().catch(() => {})
        }}
        onEnded={() => {
          if (queueIndex < queue.length - 1) {
            nextTrack()
          } else {
            setPlaying(false)
            setCurrentTime(0)
          }
        }}
        style={{ display: 'none' }}
      />

      {/* backdrop — subtle, only behind panel */}
      <div
        onClick={isExpanded ? toggleExpanded : undefined}
        style={{
          position: 'fixed', inset: 0, zIndex: 198,
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
          opacity: panelVisible ? 1 : 0,
          pointerEvents: isExpanded ? 'auto' : 'none',
          transition: 'opacity .3s ease',
        }}
      />

      {/* ── WRAPPER: anchored at bottom, same width as mini bar ── */}
      <div style={{
        position: 'fixed',
        bottom: 'calc(64px + env(safe-area-inset-bottom, 0px) + 10px)',
        left: '50%',
        transform: appear ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(130%)',
        width: 'calc(100vw - 32px)',
        maxWidth: 520,
        zIndex: 199,
        fontFamily: 'Outfit, sans-serif',
        transition: 'transform .42s cubic-bezier(0.32,0.72,0,1)',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        // don't clip — expanded panel sits above the pill
        overflow: 'visible',
      }}>

        {/* ── EXPANDED PANEL — grows upward above the mini bar ── */}
        <div style={{
          width: '100%',
          background: '#111',
          borderRadius: 16,
          marginBottom: 6,
          overflow: 'hidden',
          // height animation: 0 → auto via max-height trick
          maxHeight: panelVisible ? '78dvh' : 0,
          opacity: panelVisible ? 1 : 0,
          transform: panelVisible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
          transformOrigin: 'bottom center',
          boxShadow: '0 -4px 40px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.35)',
          transition: [
            'max-height .38s cubic-bezier(0.32,0.72,0,1)',
            'opacity .28s ease',
            'transform .38s cubic-bezier(0.32,0.72,0,1)',
          ].join(', '),
          // inner scroll
          display: 'flex', flexDirection: 'column',
        }}>

          {/* scrollable body */}
          <div style={{ overflowY: 'auto', scrollbarWidth: 'none', flex: 1 }}>
            <div style={{ padding: '18px 20px 0' }}>

              {/* drag handle */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.12)' }} />
              </div>

              {/* track info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                <div style={{ width: 52, height: 52, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {coverUrl
                    ? <img src={coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <Ic d={['M9 18V5l12-2v13', 'M6 21a3 3 0 100-6 3 3 0 000 6z', 'M18 19a3 3 0 100-6 3 3 0 000 6z']} s={18} c="rgba(255,255,255,0.22)" />
                  }
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>{trackTitle}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>
                    {[currentVer?.label, currentVer?.bpm && `${currentVer.bpm} bpm`, currentVer?.key].filter(Boolean).join(' · ')}
                    {queue.length > 1 && <span style={{ marginLeft: 6, opacity: 0.5 }}>{queueIndex + 1}/{queue.length}</span>}
                  </div>
                </div>
              </div>

              {/* waveform (full) */}
              <WaveCanvas audioUrl={audioUrl} progress={progress} onSeek={seek} height={48} />

              {/* time row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0 16px' }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontVariantNumeric: 'tabular-nums' }}>{fmt(currentTime)}</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontVariantNumeric: 'tabular-nums' }}>-{fmt(remaining)}</span>
              </div>

              {/* transport */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
                <button className="dp-iBtn" onClick={prevTrack} disabled={queueIndex <= 0} style={{ opacity: queueIndex <= 0 ? 0.2 : 1 }}>
                  <Ic d="M19 20L9 12l10-8v16zM5 19V5" s={20} />
                </button>
                <button className="dp-iBtn" onClick={() => seek(Math.max(0, progress - 15 / duration))}>
                  <SkipIcon dir="back" />
                </button>
                <button className="dp-play" onClick={() => setPlaying(!isPlaying)}
                  style={{ width: 56, height: 56, boxShadow: isPlaying ? '0 0 0 7px rgba(255,255,255,0.08)' : 'none' }}>
                  <Ic d={isPlaying ? 'M6 4h4v16H6zM14 4h4v16h-4z' : 'M5 3l14 9-14 9V3z'} s={18} c="#111" />
                </button>
                <button className="dp-iBtn" onClick={() => seek(Math.min(1, progress + 15 / duration))}>
                  <SkipIcon dir="fwd" />
                </button>
                <button className="dp-iBtn" onClick={nextTrack} disabled={queueIndex >= queue.length - 1} style={{ opacity: queueIndex >= queue.length - 1 ? 0.2 : 1 }}>
                  <Ic d="M5 4l10 8-10 8V4zM19 5v14" s={20} />
                </button>
              </div>

              {/* tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', overflowX: 'auto', scrollbarWidth: 'none' }}>
                {TABS.map(t => (
                  <button key={t.id} className={`dp-tab ${tab === t.id ? 'on' : ''}`} onClick={() => setTab(t.id)}>
                    {t.label}
                    {tab === t.id && <div style={{ height: 2, background: 'rgba(255,255,255,0.6)', borderRadius: 1, marginTop: 4 }} />}
                  </button>
                ))}
              </div>

              {/* tab content */}
              <div style={{ padding: '20px 0 28px' }}>

                {/* ── VERSIONS ── */}
                {tab === 'versions' && (
                  <div className="dp-panel-enter">
                    {versions.length === 0
                      ? <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)', margin: 0 }}>Sin versiones disponibles</p>
                      : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {versions.map(v => (
                            <button key={v.id} onClick={() => setCurrentVersion(v.id)} style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              padding: '12px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left',
                              background: v.id === currentVersionId ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                              transition: 'background .15s', fontFamily: 'inherit', minHeight: 52,
                            }}>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 500, color: v.id === currentVersionId ? '#fff' : 'rgba(255,255,255,0.6)', letterSpacing: '-0.01em' }}>{v.label}</div>
                                {(v.bpm || v.key) && (
                                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: 2 }}>
                                    {[v.bpm && `${v.bpm} bpm`, v.key].filter(Boolean).join(' · ')}
                                  </div>
                                )}
                              </div>
                              {v.id === currentVersionId && (
                                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', flexShrink: 0 }} />
                              )}
                            </button>
                          ))}
                        </div>
                      )
                    }
                  </div>
                )}

                {/* ── CONTROLS ── */}
                {tab === 'controls' && (
                  <div className="dp-panel-enter">
                    <p className="dp-sec">Pitch <span style={{ fontWeight: 400, letterSpacing: 0, textTransform: 'none', fontSize: 9, color: 'rgba(255,255,255,0.18)' }}>· semitonos</span></p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', width: 28, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>-12</span>
                      <input type="range" min={-12} max={12} step={1} value={pitch}
                        onChange={e => setPitchState(parseInt(e.target.value))}
                        onTouchStart={e => e.stopPropagation()}
                        className="dp-range"
                        style={{ background: `linear-gradient(to right, rgba(255,255,255,0.1) ${(pitch+12)/24*100}%, rgba(255,255,255,0.78) ${(pitch+12)/24*100}%)` }} />
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', width: 28, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>+12</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                      <span style={{ fontSize: 12, color: pitch !== 0 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)', fontVariantNumeric: 'tabular-nums' }}>
                        {pitch > 0 ? `+${pitch}` : pitch} st
                      </span>
                      {pitch !== 0 && (
                        <button onClick={() => setPitchState(0)} style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.07)', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '4px 10px', borderRadius: 6 }}>Reset</button>
                      )}
                    </div>

                    <p className="dp-sec">Velocidad</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', width: 28, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>0.5×</span>
                      <input type="range" min={0.5} max={2} step={0.05} value={rate}
                        onChange={e => setRateState(parseFloat(e.target.value))}
                        onTouchStart={e => e.stopPropagation()}
                        className="dp-range"
                        style={{ background: `linear-gradient(to right,rgba(255,255,255,0.78) ${(rate-0.5)/1.5*100}%,rgba(255,255,255,0.1) ${(rate-0.5)/1.5*100}%)` }} />
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', width: 28, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>2×</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontVariantNumeric: 'tabular-nums' }}>{rate.toFixed(2)}×</span>
                      {rate !== 1 && (
                        <button onClick={() => setRateState(1)} style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.07)', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '4px 10px', borderRadius: 6 }}>Reset</button>
                      )}
                    </div>
                    {pitch !== 0 && (
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', marginTop: 12 }}>
                        Velocidad efectiva: {(rate * Math.pow(2, pitch / 12)).toFixed(2)}× (velocidad + pitch combinados)
                      </p>
                    )}
                  </div>
                )}

                {/* ── EQ ── */}
                {tab === 'eq' && (
                  <div className="dp-panel-enter">
                    {!eqActive ? (
                      /* EQ not yet wired — show activation button */
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '24px 0' }}>
                        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: 0, textAlign: 'center', lineHeight: 1.5 }}>
                          El ecualizador necesita activar el procesamiento de audio.<br />
                          Pulsa el botón para habilitarlo.
                        </p>
                        <button
                          onClick={activateEq}
                          style={{
                            fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                            color: '#111', background: '#fff', border: 'none',
                            padding: '12px 28px', borderRadius: 10, cursor: 'pointer',
                          }}
                        >Activar EQ</button>
                      </div>
                    ) : (
                      /* EQ active — show sliders */
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                          <p className="dp-sec" style={{ margin: 0 }}>Ecualizador 3 bandas</p>
                          {(eqBass !== 0 || eqMid !== 0 || eqTreble !== 0) && (
                            <button onClick={() => { setEqBass(0); setEqMid(0); setEqTreble(0) }} style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.07)', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '4px 10px', borderRadius: 6 }}>Reset</button>
                          )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
                          {[
                            { label: 'Graves', freq: '200 Hz', val: eqBass, set: setEqBass },
                            { label: 'Medios', freq: '1 kHz',  val: eqMid,   set: setEqMid },
                            { label: 'Agudos', freq: '8 kHz',  val: eqTreble, set: setEqTreble },
                          ].map(({ label, freq, val, set }) => {
                            const pct = (val + 12) / 24 * 100
                            const bg = val > 0
                              ? `linear-gradient(to right, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0.75) ${pct}%, rgba(255,255,255,0.1) ${pct}%)`
                              : val < 0
                              ? `linear-gradient(to right, rgba(255,255,255,0.1) ${pct}%, rgba(255,255,255,0.75) ${pct}%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0.1) 50%)`
                              : 'rgba(255,255,255,0.1)'
                            return (
                              <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{label}</span>
                                <div style={{ height: 88, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <input type="range" min={-12} max={12} step={1} value={val}
                                    onChange={e => set(parseInt(e.target.value))}
                                    onTouchStart={e => e.stopPropagation()}
                                    className="dp-range"
                                    style={{ width: 88, transform: 'rotate(-90deg)', transformOrigin: 'center', background: bg }} />
                                </div>
                                <span style={{ fontSize: 11, color: val !== 0 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)', fontVariantNumeric: 'tabular-nums' }}>
                                  {val > 0 ? `+${val}` : val} dB
                                </span>
                                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginTop: -4 }}>{freq}</span>
                              </div>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* ── STEMS ── */}
                {tab === 'stems' && (
                  <div className="dp-panel-enter">
                    <p className="dp-sec">Pistas separadas</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {['Voces', 'Batería', 'Bajo', 'Instrumentos'].map(s => (
                        <div key={s} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', opacity: 0.5 }}>
                          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>{s}</span>
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 4 }}>Próximamente</span>
                        </div>
                      ))}
                    </div>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.15)', marginTop: 16 }}>La separación de stems mediante IA estará disponible próximamente.</p>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>

        {/* ══ MINI BAR ══ */}
        <div
          onClick={toggleExpanded}
          style={{
            position: 'relative',
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '0 6px 0 10px', height: 68,
            background: '#111',
            borderRadius: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
            flexShrink: 0,
            cursor: 'pointer',
            overflow: 'hidden',
            WebkitTapHighlightColor: 'transparent',
            userSelect: 'none',
          }}
        >
          {/* thin progress line at bottom */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0,
            height: 2, width: `${progress * 100}%`,
            background: 'rgba(255,255,255,0.28)',
            pointerEvents: 'none',
            transition: 'width 0.25s linear',
          }} />

          {/* cover */}
          <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {coverUrl
              ? <img src={coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              : <Ic d={['M9 18V5l12-2v13', 'M6 21a3 3 0 100-6 3 3 0 000 6z', 'M18 19a3 3 0 100-6 3 3 0 000 6z']} s={14} c="rgba(255,255,255,0.2)" />
            }
          </div>

          {/* title + queue position */}
          <div style={{ flexShrink: 0, width: 80, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.35 }}>{trackTitle}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentVer?.label ?? ''}
              {queue.length > 1 && <span style={{ marginLeft: 5, opacity: 0.55 }}>{queueIndex + 1}/{queue.length}</span>}
            </div>
          </div>

          {/* scrolling waveform — stopPropagation so seeking doesn't toggle expand */}
          <div style={{ flex: 1, minWidth: 0 }} onClick={e => e.stopPropagation()}>
            <WaveCanvas audioUrl={audioUrl} progress={progress} onSeek={seek} height={36} mini />
          </div>

          {/* controls — stopPropagation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
            <button className="dp-play" onClick={() => setPlaying(!isPlaying)}
              style={{ width: 42, height: 42, flexShrink: 0, boxShadow: isPlaying ? '0 0 0 5px rgba(255,255,255,0.1)' : 'none' }}>
              <Ic d={isPlaying ? 'M6 4h4v16H6zM14 4h4v16h-4z' : 'M5 3l14 9-14 9V3z'} s={13} c="#111" />
            </button>

            {queue.length > 1 && queueIndex < queue.length - 1 && (
              <button className="dp-iBtn sm" onClick={nextTrack}>
                <Ic d="M5 4l10 8-10 8V4zM19 5v14" s={14} />
              </button>
            )}

            <button className="dp-iBtn sm" onClick={close}>
              <Ic d="M18 6L6 18M6 6l12 12" s={14} />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

