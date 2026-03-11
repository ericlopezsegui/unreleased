'use client'

import { PlayerWave } from './player-wave'

function Ic({ d, s = 16, c = 'currentColor', w = 1.5 }: { d: string | string[]; s?: number; c?: string; w?: number }) {
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      {(Array.isArray(d) ? d : [d]).map((p, i) => <path key={i} d={p} />)}
    </svg>
  )
}

export function PlayerMini({
  trackTitle,
  versionLabel,
  coverUrl,
  progress,
  audioUrl,
  isPlaying,
  canGoNext,
  onToggleExpanded,
  onTogglePlay,
  onNext,
  onClose,
  onSeek,
}: {
  trackTitle: string | null
  versionLabel?: string
  coverUrl?: string | null
  progress: number
  audioUrl: string | null
  isPlaying: boolean
  canGoNext: boolean
  onToggleExpanded: () => void
  onTogglePlay: () => void
  onNext: () => void
  onClose: () => void
  onSeek: (p: number) => void
}) {
  return (
    <div
      onClick={onToggleExpanded}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 6px 0 10px',
        height: 68,
        background: '#111',
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
        cursor: 'pointer',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: `${progress * 100}%`,
          height: 2,
          background: 'rgba(255,255,255,0.28)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          width: 44,
          height: 44,
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
          <img src={coverUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <Ic d={['M9 18V5l12-2v13', 'M6 21a3 3 0 100-6 3 3 0 000 6z', 'M18 19a3 3 0 100-6 3 3 0 000 6z']} s={14} c="rgba(255,255,255,0.2)" />
        )}
      </div>

      <div style={{ flexShrink: 0, width: 88, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {trackTitle ?? 'Sin pista'}
        </div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {versionLabel ?? ''}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }} onClick={(e) => e.stopPropagation()}>
        <PlayerWave audioUrl={audioUrl} progress={progress} onSeek={onSeek} height={36} mini />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onTogglePlay}
          style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            border: 'none',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Ic d={isPlaying ? 'M6 4h4v16H6zM14 4h4v16h-4z' : 'M5 3l14 9-14 9V3z'} s={13} c="#111" />
        </button>

        {canGoNext && (
          <button
            onClick={onNext}
            style={{
              minWidth: 36,
              minHeight: 36,
              border: 'none',
              background: 'none',
              color: 'rgba(255,255,255,0.42)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Ic d="M5 4l10 8-10 8V4zM19 5v14" s={14} />
          </button>
        )}

        <button
          onClick={onClose}
          style={{
            minWidth: 36,
            minHeight: 36,
            border: 'none',
            background: 'none',
            color: 'rgba(255,255,255,0.42)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Ic d="M18 6L6 18M6 6l12 12" s={14} />
        </button>
      </div>
    </div>
  )
}