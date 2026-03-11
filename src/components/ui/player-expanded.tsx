'use client'

import { PlayerTab, StemTrack, TrackVersion } from '@/stores/player-store'
import { PlayerWave } from './player-wave'
import { VersionsPanel } from './player-tabs/versions-panel'
import { ControlsPanel } from './player-tabs/controls-panel'
import { EqPanel } from './player-tabs/eq-panel'
import { StemsPanel } from './player-tabs/stems-panel'

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

  const tabs: Array<{ id: PlayerTab; label: string }> = [
    { id: 'versions', label: 'Versiones' },
    { id: 'controls', label: 'Controles' },
    { id: 'eq', label: 'EQ' },
    { id: 'stems', label: 'Stems' },
  ]

  return (
    <>
      <div
        onClick={onDismiss}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 198,
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          opacity: isVisible ? 1 : 0,
          pointerEvents: isVisible ? 'auto' : 'none',
          transition: 'opacity .28s ease',
        }}
      />

      <div
        style={{
          width: '100%',
          background: '#111',
          borderRadius: 16,
          marginBottom: 6,
          overflow: 'hidden',
          maxHeight: isVisible ? '78dvh' : 0,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
          transformOrigin: 'bottom center',
          boxShadow: '0 -4px 40px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.35)',
          transition: 'max-height .38s cubic-bezier(0.32,0.72,0,1), opacity .28s ease, transform .38s cubic-bezier(0.32,0.72,0,1)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 199,
        }}
      >
        <div style={{ overflowY: 'auto', scrollbarWidth: 'none', flex: 1 }}>
          <div style={{ padding: '18px 20px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.12)' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 8,
                  overflow: 'hidden',
                  flexShrink: 0,
                  background: 'rgba(255,255,255,0.07)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {coverUrl ? (
                  <img src={coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Ic d={['M9 18V5l12-2v13', 'M6 21a3 3 0 100-6 3 3 0 000 6z', 'M18 19a3 3 0 100-6 3 3 0 000 6z']} s={18} c="rgba(255,255,255,0.22)" />
                )}
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {trackTitle ?? 'Sin pista'}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>
                  {[version?.label, version?.bpm && `${version.bpm} bpm`, version?.key].filter(Boolean).join(' · ')}
                  {queueLength > 1 && <span style={{ marginLeft: 6, opacity: 0.5 }}>{queueIndex + 1}/{queueLength}</span>}
                </div>
              </div>
            </div>

            <PlayerWave audioUrl={audioUrl} progress={progress} onSeek={onSeek} height={48} />

            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '6px 0 16px' }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontVariantNumeric: 'tabular-nums' }}>{fmt(currentTime)}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontVariantNumeric: 'tabular-nums' }}>-{fmt(remaining)}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
              <button
                onClick={onPrev}
                style={{
                  minWidth: 44,
                  minHeight: 44,
                  border: 'none',
                  background: 'none',
                  color: 'rgba(255,255,255,0.38)',
                  cursor: 'pointer',
                }}
              >
                <Ic d="M19 20L9 12l10-8v16zM5 19V5" s={20} />
              </button>

              <button
                onClick={onTogglePlay}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ic d={isPlaying ? 'M6 4h4v16H6zM14 4h4v16h-4z' : 'M5 3l14 9-14 9V3z'} s={18} c="#111" />
              </button>

              <button
                onClick={onNext}
                style={{
                  minWidth: 44,
                  minHeight: 44,
                  border: 'none',
                  background: 'none',
                  color: 'rgba(255,255,255,0.38)',
                  cursor: 'pointer',
                }}
              >
                <Ic d="M5 4l10 8-10 8V4zM19 5v14" s={20} />
              </button>
            </div>

            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', overflowX: 'auto', scrollbarWidth: 'none' }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onChangeTab(tab.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.3)',
                    fontFamily: 'inherit',
                    fontSize: 12,
                    fontWeight: 500,
                    padding: '10px 14px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div style={{ height: 2, background: 'rgba(255,255,255,0.6)', borderRadius: 1, marginTop: 4 }} />
                  )}
                </button>
              ))}
            </div>

            <div style={{ padding: '20px 0 28px' }}>
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
              {activeTab === 'stems' && <StemsPanel stems={stems} />}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}