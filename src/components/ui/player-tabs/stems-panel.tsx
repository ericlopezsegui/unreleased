'use client'

import { useEffect, useMemo, useState } from 'react'
import { getAudioEngine } from '@/lib/audio/engine-instance'
import { usePlayerStore } from '@/stores/player-store'

function Ic({ d, s = 16, c = 'currentColor' }: { d: string | string[]; s?: number; c?: string }) {
  const paths = Array.isArray(d) ? d : [d]
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke={c}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths.map((p, i) => (
        <path key={i} d={p} />
      ))}
    </svg>
  )
}

type StemUiState = {
  volume: number
  muted: boolean
  solo: boolean
}

const DEFAULT_STATE: StemUiState = {
  volume: 1,
  muted: false,
  solo: false,
}

export function StemsPanel() {
  const stems = usePlayerStore(s => s.stems)
  const isOpen = usePlayerStore(s => s.isOpen)
  const currentVersionId = usePlayerStore(s => s.currentVersionId)

  const [stemStates, setStemStates] = useState<Record<string, StemUiState>>({})

  const availableStems = useMemo(
    () => stems.filter(stem => !!stem.audioUrl),
    [stems]
  )

  useEffect(() => {
    if (!isOpen) return

    const next: Record<string, StemUiState> = {}
    for (const stem of availableStems) {
      next[stem.id] = stemStates[stem.id] ?? DEFAULT_STATE
    }
    setStemStates(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentVersionId, stems])

  const setVolume = (stemId: string, value: number) => {
    const engine = getAudioEngine()

    setStemStates(prev => ({
      ...prev,
      [stemId]: {
        ...(prev[stemId] ?? DEFAULT_STATE),
        volume: value,
      },
    }))

    if (typeof engine?.setStemVolume === 'function') {
      engine.setStemVolume(stemId, value)
    }
  }

  const toggleMute = (stemId: string) => {
    const engine = getAudioEngine()
    const nextMuted = !(stemStates[stemId]?.muted ?? false)

    setStemStates(prev => ({
      ...prev,
      [stemId]: {
        ...(prev[stemId] ?? DEFAULT_STATE),
        muted: nextMuted,
      },
    }))

    if (typeof engine?.toggleStemMute === 'function') {
      engine.toggleStemMute(stemId)
      return
    }

    if (typeof engine?.setStemMuted === 'function') {
      engine.setStemMuted(stemId, nextMuted)
    }
  }

  const toggleSolo = (stemId: string) => {
    const engine = getAudioEngine()
    const nextSolo = !(stemStates[stemId]?.solo ?? false)

    setStemStates(prev => ({
      ...prev,
      [stemId]: {
        ...(prev[stemId] ?? DEFAULT_STATE),
        solo: nextSolo,
      },
    }))

    if (typeof engine?.toggleStemSolo === 'function') {
      engine.toggleStemSolo(stemId)
      return
    }

    if (typeof engine?.setStemSolo === 'function') {
      engine.setStemSolo(stemId, nextSolo)
    }
  }

  const resetStem = (stemId: string) => {
    const engine = getAudioEngine()

    setStemStates(prev => ({
      ...prev,
      [stemId]: { ...DEFAULT_STATE },
    }))

    if (typeof engine?.setStemVolume === 'function') {
      engine.setStemVolume(stemId, 1)
    }
    if (typeof engine?.setStemMuted === 'function') {
      engine.setStemMuted(stemId, false)
    }
    if (typeof engine?.setStemSolo === 'function') {
      engine.setStemSolo(stemId, false)
    }
  }

  const resetAll = () => {
    const engine = getAudioEngine()

    const next: Record<string, StemUiState> = {}
    for (const stem of availableStems) {
      next[stem.id] = { ...DEFAULT_STATE }

      if (typeof engine?.setStemVolume === 'function') {
        engine.setStemVolume(stem.id, 1)
      }
      if (typeof engine?.setStemMuted === 'function') {
        engine.setStemMuted(stem.id, false)
      }
      if (typeof engine?.setStemSolo === 'function') {
        engine.setStemSolo(stem.id, false)
      }
    }

    setStemStates(next)
  }

  const getStemIcon = (stemType?: string) => {
    switch (stemType) {
      case 'vocals':
        return ['M12 2a4 4 0 014 4v6a4 4 0 01-8 0V6a4 4 0 014-4z', 'M19 10a7 7 0 01-14 0', 'M12 19v3', 'M8 22h8']
      case 'drums':
        return ['M6 8h12', 'M8 8V6h8v2', 'M7 8l-2 10', 'M17 8l2 10', 'M9 18h6']
      case 'bass':
        return ['M6 18V6l10-2v12', 'M6 18a2.5 2.5 0 105 0 2.5 2.5 0 00-5 0z', 'M16 16a2.5 2.5 0 105 0 2.5 2.5 0 00-5 0z']
      default:
        return ['M9 18V5l12-2v13', 'M6 21a3 3 0 100-6 3 3 0 000 6z', 'M18 19a3 3 0 100-6 3 3 0 000 6z']
    }
  }

  if (!availableStems.length) {
    return (
      <div style={{ padding: '24px 16px 8px', textAlign: 'center' }}>
        <div
          style={{
            width: 52,
            height: 52,
            margin: '0 auto 10px',
            borderRadius: 16,
            background: 'rgba(0,0,0,0.03)',
            border: '1px solid rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ic d={['M4 7h16', 'M4 12h10', 'M4 17h7']} s={20} c="#bbb" />
        </div>
        <p style={{ margin: 0, fontSize: 13, color: '#888', fontWeight: 500 }}>
          No hay stems disponibles
        </p>
        <p style={{ margin: '6px 0 0', fontSize: 11, color: '#bbb' }}>
          Esta versión no tiene stems asociados
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: '14px 0 4px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px 12px',
        }}
      >
        <div>
          <p style={{ margin: 0, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#aaa', fontWeight: 700 }}>
            Stems
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#888' }}>
            Ajusta volumen, mute y solo
          </p>
        </div>

        <button
          onClick={resetAll}
          style={{
            height: 30,
            padding: '0 12px',
            borderRadius: 999,
            border: '1px solid rgba(0,0,0,0.08)',
            background: '#fff',
            color: '#666',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Reset
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '0 12px' }}>
        {availableStems.map(stem => {
          const state = stemStates[stem.id] ?? DEFAULT_STATE

          return (
            <div
              key={stem.id}
              style={{
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.05)',
                borderRadius: 14,
                padding: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    background: 'rgba(0,0,0,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Ic d={getStemIcon(stem.stemType)} s={16} c="#666" />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#0f0f0f',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {stem.label}
                  </div>
                  <div style={{ fontSize: 11, color: '#999', textTransform: 'capitalize' }}>
                    {stem.stemType ?? 'stem'}
                  </div>
                </div>

                <button
                  onClick={() => resetStem(stem.id)}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    border: '1px solid rgba(0,0,0,0.06)',
                    background: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                  title="Reset stem"
                >
                  <Ic d={['M3 12a9 9 0 109-9', 'M3 3v6h6']} s={13} c="#777" />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 11, color: '#999', width: 28, textAlign: 'left' }}>
                  {Math.round(state.volume * 100)}%
                </span>

                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={state.volume}
                  onChange={e => setVolume(stem.id, Number(e.target.value))}
                  style={{ flex: 1 }}
                />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => toggleMute(stem.id)}
                  style={{
                    flex: 1,
                    height: 34,
                    borderRadius: 999,
                    border: '1px solid',
                    borderColor: state.muted ? '#0f0f0f' : 'rgba(0,0,0,0.08)',
                    background: state.muted ? '#0f0f0f' : '#fff',
                    color: state.muted ? '#fff' : '#666',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Mute
                </button>

                <button
                  onClick={() => toggleSolo(stem.id)}
                  style={{
                    flex: 1,
                    height: 34,
                    borderRadius: 999,
                    border: '1px solid',
                    borderColor: state.solo ? '#0f0f0f' : 'rgba(0,0,0,0.08)',
                    background: state.solo ? '#0f0f0f' : '#fff',
                    color: state.solo ? '#fff' : '#666',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Solo
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}