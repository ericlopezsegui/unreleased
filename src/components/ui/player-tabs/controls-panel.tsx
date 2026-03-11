'use client'

function sectionTitle(title: string, subtitle?: string) {
  return (
    <p
      style={{
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '.18em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.28)',
        margin: '0 0 14px',
      }}
    >
      {title}
      {subtitle && (
        <span
          style={{
            fontWeight: 400,
            letterSpacing: 0,
            textTransform: 'none',
            fontSize: 9,
            color: 'rgba(255,255,255,0.18)',
            marginLeft: 6,
          }}
        >
          {subtitle}
        </span>
      )}
    </p>
  )
}

function sliderStyle(percent: number): React.CSSProperties {
  return {
    width: '100%',
    appearance: 'none',
    WebkitAppearance: 'none',
    height: 6,
    borderRadius: 999,
    outline: 'none',
    cursor: 'pointer',
    background: `linear-gradient(to right, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.82) ${percent}%, rgba(255,255,255,0.12) ${percent}%, rgba(255,255,255,0.12) 100%)`,
  }
}

function thumbCss() {
  return `
    .ur-player-range {
      -webkit-appearance: none;
      appearance: none;
      height: 6px;
      border-radius: 999px;
      outline: none;
      cursor: pointer;
      background: transparent;
    }

    .ur-player-range::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 999px;
      background: #ffffff;
      border: 0;
      box-shadow: 0 2px 10px rgba(0,0,0,0.45);
      cursor: pointer;
      margin-top: -7px;
    }

    .ur-player-range::-webkit-slider-runnable-track {
      height: 6px;
      border-radius: 999px;
      background: transparent;
    }

    .ur-player-range::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 999px;
      background: #ffffff;
      border: 0;
      box-shadow: 0 2px 10px rgba(0,0,0,0.45);
      cursor: pointer;
    }

    .ur-player-range::-moz-range-track {
      height: 6px;
      border-radius: 999px;
      background: transparent;
    }
  `
}

export function ControlsPanel({
  rate,
  pitch,
  onChangeRate,
  onChangePitch,
  baseBpm,
}: {
  rate: number
  pitch: number
  onChangeRate: (rate: number) => void
  onChangePitch: (pitch: number) => void
  baseBpm?: number | null
}) {
  const speedPercent = ((rate - 0.5) / 1.5) * 100
  const pitchPercent = ((pitch + 12) / 24) * 100
  const adjustedBpm = baseBpm ? Math.round(baseBpm * rate * 10) / 10 : null

  return (
    <div>
      <style>{thumbCss()}</style>

      {sectionTitle('Pitch', '· semitonos')}

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
        <span
          style={{
            fontSize: 10,
            color: 'rgba(255,255,255,0.28)',
            width: 28,
            textAlign: 'right',
            flexShrink: 0,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          -12
        </span>

        <input
          className="ur-player-range"
          type="range"
          min={-12}
          max={12}
          step={1}
          value={pitch}
          onChange={(e) => onChangePitch(parseInt(e.target.value, 10))}
          style={sliderStyle(pitchPercent)}
        />

        <span
          style={{
            fontSize: 10,
            color: 'rgba(255,255,255,0.28)',
            width: 28,
            flexShrink: 0,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          +12
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        <span
          style={{
            fontSize: 12,
            color: pitch !== 0 ? 'rgba(255,255,255,0.62)' : 'rgba(255,255,255,0.24)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {pitch > 0 ? `+${pitch}` : pitch} st
        </span>

        {pitch !== 0 && (
          <button
            onClick={() => onChangePitch(0)}
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.36)',
              background: 'rgba(255,255,255,0.07)',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              padding: '4px 10px',
              borderRadius: 6,
            }}
          >
            Reset
          </button>
        )}
      </div>

      {sectionTitle('Velocidad')}

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
        <span
          style={{
            fontSize: 10,
            color: 'rgba(255,255,255,0.28)',
            width: 28,
            textAlign: 'right',
            flexShrink: 0,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          0.5×
        </span>

        <input
          className="ur-player-range"
          type="range"
          min={0.5}
          max={2}
          step={0.05}
          value={rate}
          onChange={(e) => onChangeRate(parseFloat(e.target.value))}
          style={sliderStyle(speedPercent)}
        />

        <span
          style={{
            fontSize: 10,
            color: 'rgba(255,255,255,0.28)',
            width: 28,
            flexShrink: 0,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          2×
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.55)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {rate.toFixed(2)}×
        </span>

        {adjustedBpm !== null && (
          <span
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.36)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            · {adjustedBpm} BPM
          </span>
        )}

        {rate !== 1 && (
          <button
            onClick={() => onChangeRate(1)}
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.36)',
              background: 'rgba(255,255,255,0.07)',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              padding: '4px 10px',
              borderRadius: 6,
            }}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  )
}