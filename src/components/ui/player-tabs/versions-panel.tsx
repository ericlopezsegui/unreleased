'use client'

import { TrackVersion } from '@/stores/player-store'

export function VersionsPanel({
  versions,
  currentVersionId,
  onSelect,
}: {
  versions: TrackVersion[]
  currentVersionId: string | null
  onSelect: (id: string) => void
}) {
  if (!versions.length) {
    return <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', margin: 0 }}>Sin versiones disponibles</p>
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {versions.map((v) => (
        <button
          key={v.id}
          onClick={() => onSelect(v.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderRadius: 12,
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            background: v.id === currentVersionId ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.04)',
            color: '#fff',
            fontFamily: 'inherit',
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{v.label}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', marginTop: 2 }}>
              {[v.bpm && `${v.bpm} bpm`, v.key].filter(Boolean).join(' · ') || 'Versión'}
            </div>
          </div>

          {v.id === currentVersionId && (
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />
          )}
        </button>
      ))}
    </div>
  )
}