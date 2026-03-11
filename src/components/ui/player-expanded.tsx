'use client'

import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { PlayerTab, StemTrack, TrackVersion } from '@/stores/player-store'
import { PlayerWave } from './player-wave'
import { VersionsPanel } from './player-tabs/versions-panel'
import { ControlsPanel } from './player-tabs/controls-panel'
import { EqPanel } from './player-tabs/eq-panel'
import { StemsPanel } from './player-tabs/stems-panel'

const PLAYER_CSS = `
@keyframes urTabIn {
  from { opacity: 0; transform: translate3d(0,4px,0); }
  to   { opacity: 1; transform: translate3d(0,0,0); }
}

.ur-tab-pane {
  animation: urTabIn .18s ease-out both;
  will-change: opacity, transform;
}

.ur-hide-scrollbar {
  scrollbar-width: none;
}
.ur-hide-scrollbar::-webkit-scrollbar {
  display: none;
}
`

function Ic({
  d,
  s = 16,
  c = 'currentColor',
  w = 1.5,
}: {
  d: string | string[]
  s?: number
  c?: string
  w?: number
}) {
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth={w}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {(Array.isArray(d) ? d : [d]).map((p, i) => (
        <path key={i} d={p} />
      ))}
    </svg>
  )
}

function fmt(s: number) {
  if (!s || isNaN(s) || !isFinite(s)) return '0:00'
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

const PlayerHeader = memo(function PlayerHeader({
  trackTitle,
  coverUrl,
  version,
  queueIndex,
  queueLength,
}: {
  trackTitle: string | null
  coverUrl?: string | null
  version?: TrackVersion
  queueIndex: number
  queueLength: number
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 10,
          overflow: 'hidden',
          flexShrink: 0,
          background: 'rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: coverUrl ? '0 4px 20px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        {coverUrl ? (
          <img src={coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Ic
            d={['M9 18V5l12-2v13', 'M6 21a3 3 0 100-6 3 3 0 000 6z', 'M18 19a3 3 0 100-6 3 3 0 000 6z']}
            s={18}
            c="rgba(255,255,255,0.18)"
          />
        )}
      </div>

      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: '#fff',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            letterSpacing: '-0.01em',
          }}
        >
          {trackTitle ?? 'Sin pista'}
        </div>

        <div
          style={{
            fontSize: 11,
            color: 'rgba(255,255,255,0.32)',
            marginTop: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {[version?.label, version?.bpm && `${version.bpm} bpm`, version?.key].filter(Boolean).join(' · ')}
          </span>

          {queueLength > 1 && (
            <span
              style={{
                flexShrink: 0,
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 4,
                padding: '1px 5px',
                fontSize: 10,
              }}
            >
              {queueIndex + 1}/{queueLength}
            </span>
          )}
        </div>
      </div>
    </div>
  )
})

const PlayerTimeRow = memo(function PlayerTimeRow({
  currentTime,
  remaining,
}: {
  currentTime: number
  remaining: number
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 2px 22px' }}>
      <span
        style={{
          fontSize: 11,
          color: 'rgba(255,255,255,0.28)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {fmt(currentTime)}
      </span>

      <span
        style={{
          fontSize: 11,
          color: 'rgba(255,255,255,0.28)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        -{fmt(remaining)}
      </span>
    </div>
  )
})

const PlayerTransport = memo(function PlayerTransport({
  isPlaying,
  onPrev,
  onNext,
  onTogglePlay,
}: {
  isPlaying: boolean
  onPrev: () => void
  onNext: () => void
  onTogglePlay: () => void
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        marginBottom: 26,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: 20 }}>
        <button
          onClick={onPrev}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.65)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ic d="M19 20L9 12l10-8v16zM5 19V5" s={18} />
        </button>
      </div>

      <button
        onClick={onTogglePlay}
        style={{
          width: 62,
          height: 62,
          borderRadius: '50%',
          background: '#fff',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 28px rgba(255,255,255,0.18)',
          flexShrink: 0,
          transform: 'translateZ(0)',
        }}
      >
        <Ic
          d={isPlaying ? 'M6 4h4v16H6zM14 4h4v16h-4z' : 'M5 3l14 9-14 9V3z'}
          s={20}
          c="#111"
          w={2}
        />
      </button>

      <div style={{ display: 'flex', justifyContent: 'flex-start', paddingLeft: 20 }}>
        <button
          onClick={onNext}
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.65)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ic d="M5 4l10 8-10 8V4zM19 5v14" s={18} />
        </button>
      </div>
    </div>
  )
})

const PlayerTabs = memo(function PlayerTabs({
  tabs,
  activeTab,
  onChangeTab,
}: {
  tabs: Array<{ id: PlayerTab; label: string }>
  activeTab: PlayerTab
  onChangeTab: (tab: PlayerTab) => void
}) {
  const tabIndex = tabs.findIndex((t) => t.id === activeTab)

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChangeTab(tab.id)}
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.28)',
            fontFamily: 'inherit',
            fontSize: 12,
            fontWeight: activeTab === tab.id ? 600 : 400,
            padding: '10px 8px 13px',
            whiteSpace: 'nowrap',
            transition: 'color .18s ease',
          }}
        >
          {tab.label}
        </button>
      ))}

      <div
        style={{
          position: 'absolute',
          bottom: -1,
          left: `${tabIndex * 25}%`,
          width: '25%',
          height: 2,
          background: 'rgba(255,255,255,0.78)',
          borderRadius: 999,
          transition: 'left .22s cubic-bezier(.22,1,.36,1)',
          willChange: 'left',
          pointerEvents: 'none',
          transform: 'translateZ(0)',
        }}
      />
    </div>
  )
})

const PlayerTabPanel = memo(function PlayerTabPanel({
  activeTab,
  versions,
  version,
  onSelectVersion,
  rate,
  pitch,
  setRate,
  setPitch,
  eq,
  setEq,
}: {
  activeTab: PlayerTab
  versions: TrackVersion[]
  version?: TrackVersion
  onSelectVersion: (id: string) => void
  rate: number
  pitch: number
  setRate: (rate: number) => void
  setPitch: (pitch: number) => void
  eq: { bass: number; mid: number; treble: number }
  setEq: (eq: { bass: number; mid: number; treble: number }) => void
}) {
  return (
    <div className="ur-tab-pane" style={{ padding: '20px 0 32px' }}>
      {activeTab === 'versions' && (
        <VersionsPanel
          versions={versions}
          currentVersionId={version?.id ?? null}
          onSelect={onSelectVersion}
        />
      )}

      {activeTab === 'controls' && (
        <ControlsPanel
          rate={rate}
          pitch={pitch}
          onChangeRate={setRate}
          onChangePitch={setPitch}
        />
      )}

      {activeTab === 'eq' && <EqPanel eq={eq} setEq={setEq} />}

      {activeTab === 'stems' && <StemsPanel />}
    </div>
  )
})

const MemoPlayerWave = memo(PlayerWave)

export function PlayerExpanded({
  pitch,
  rate,
  eq,
  isVisible,
  trackTitle,
  coverUrl,
  version,
  versions,
  stems,
  queueIndex,
  queueLength,
  currentTime,
  duration,
  progress,
  activeTab,
  audioUrl,
  isPlaying,
  onDismiss,
  onSeek,
  onTogglePlay,
  onPrev,
  onNext,
  onSelectVersion,
  onChangeTab,
  setRate,
  setPitch,
  setEq,
}: {
  rate: number
  pitch: number
  eq: { bass: number; mid: number; treble: number }
  isVisible: boolean
  trackTitle: string | null
  coverUrl?: string | null
  version?: TrackVersion
  versions: TrackVersion[]
  stems: StemTrack[]
  queueIndex: number
  queueLength: number
  currentTime: number
  duration: number
  progress: number
  activeTab: PlayerTab
  audioUrl: string | null
  isPlaying: boolean
  onDismiss: () => void
  onSeek: (progress: number) => void
  onTogglePlay: () => void
  onPrev: () => void
  onNext: () => void
  onSelectVersion: (id: string) => void
  onChangeTab: (tab: PlayerTab) => void
  setRate: (rate: number) => void
  setPitch: (pitch: number) => void
  setEq: (eq: { bass: number; mid: number; treble: number }) => void
}) {
  const remaining = Math.max(duration - currentTime, 0)

  const tabs: Array<{ id: PlayerTab; label: string }> = useMemo(
    () => [
      { id: 'versions', label: 'Versiones' },
      { id: 'controls', label: 'Controles' },
      { id: 'eq', label: 'EQ' },
      { id: 'stems', label: 'Stems' },
    ],
    []
  )

  const contentRef = useRef<HTMLDivElement>(null)
  const [contentH, setContentH] = useState<number | null>(null)

  const measure = useCallback(() => {
    const el = contentRef.current
    if (!el) return

    const next = el.scrollHeight
    setContentH((prev) => {
      if (prev === next) return prev
      return next
    })
  }, [])

  useLayoutEffect(() => {
    measure()
  }, [activeTab, measure])

  useEffect(() => {
    if (activeTab !== 'stems') return

    const el = contentRef.current
    if (!el || typeof ResizeObserver === 'undefined') return

    let raf = 0

    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        measure()
      })
    })

    ro.observe(el)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [activeTab, measure])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PLAYER_CSS }} />

      <div
        style={{
          width: '100%',
          height: '80dvh',
          background: 'rgba(16,16,20,0.94)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.07)',
          marginBottom: 6,
          overflow: 'hidden',
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translate3d(0,0,0)' : 'translate3d(0,20px,0)',
          transformOrigin: 'bottom center',
          boxShadow: '0 -2px 60px rgba(0,0,0,0.65), 0 8px 32px rgba(0,0,0,0.4)',
          transition: 'opacity .22s ease, transform .30s cubic-bezier(.22,1,.36,1)',
          willChange: 'transform, opacity',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 199,
          pointerEvents: isVisible ? 'auto' : 'none',
          contain: 'layout paint style',
        }}
      >
        <div className="ur-hide-scrollbar" style={{ overflowY: 'auto', flex: 1 }}>
          <div style={{ padding: '16px 20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <div
                style={{
                  width: 32,
                  height: 4,
                  borderRadius: 2,
                  background: 'rgba(255,255,255,0.10)',
                }}
              />
            </div>

            <PlayerHeader
              trackTitle={trackTitle}
              coverUrl={coverUrl}
              version={version}
              queueIndex={queueIndex}
              queueLength={queueLength}
            />

            <MemoPlayerWave audioUrl={audioUrl} progress={progress} onSeek={onSeek} height={52} />

            <PlayerTimeRow currentTime={currentTime} remaining={remaining} />

            <PlayerTransport
              isPlaying={isPlaying}
              onPrev={onPrev}
              onNext={onNext}
              onTogglePlay={onTogglePlay}
            />

            <PlayerTabs tabs={tabs} activeTab={activeTab} onChangeTab={onChangeTab} />

            <div
              style={{
                height: contentH ?? 'auto',
                transition: 'height .22s cubic-bezier(.22,1,.36,1)',
                willChange: 'height',
                overflow: 'hidden',
                contain: 'layout',
              }}
            >
              <div ref={contentRef}>
                <PlayerTabPanel
                  activeTab={activeTab}
                  versions={versions}
                  version={version}
                  onSelectVersion={onSelectVersion}
                  rate={rate}
                  pitch={pitch}
                  setRate={setRate}
                  setPitch={setPitch}
                  eq={eq}
                  setEq={setEq}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}