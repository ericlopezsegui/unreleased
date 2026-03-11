'use client'

import { StemTrack } from '@/stores/player-store'

export function StemsPanel({ stems }: { stems: StemTrack[] }) {
  const fallback = ['Voces', 'Batería', 'Bajo', 'Instrumentos']

  const items =
    stems.length > 0
      ? stems
      : fallback.map((label, index) => ({
          id: `fallback-${index}`,
          label,
        }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((stem) => (
        <div
          key={stem.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.04)',
          }}
        >
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{stem.label}</span>
          <span
            style={{
              fontSize: 10,
              color: 'rgba(255,255,255,0.25)',
              background: 'rgba(255,255,255,0.06)',
              padding: '4px 8px',
              borderRadius: 999,
            }}
          >
            Próximamente
          </span>
        </div>
      ))}
    </div>
  )
}