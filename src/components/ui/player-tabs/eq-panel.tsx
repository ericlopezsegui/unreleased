'use client'

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
    .ur-eq-range {
      -webkit-appearance: none;
      appearance: none;
      height: 6px;
      border-radius: 999px;
      outline: none;
      cursor: pointer;
      background: transparent;
    }

    .ur-eq-range::-webkit-slider-thumb {
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

    .ur-eq-range::-webkit-slider-runnable-track {
      height: 6px;
      border-radius: 999px;
      background: transparent;
    }

    .ur-eq-range::-moz-range-thumb {
      width: 20px;
      height: 20px;
      border-radius: 999px;
      background: #ffffff;
      border: 0;
      box-shadow: 0 2px 10px rgba(0,0,0,0.45);
      cursor: pointer;
    }

    .ur-eq-range::-moz-range-track {
      height: 6px;
      border-radius: 999px;
      background: transparent;
    }
  `
}

export function EqPanel({
  eq,
  setEq,
}: {
  eq: { bass: number; mid: number; treble: number }
  setEq: (eq: { bass: number; mid: number; treble: number }) => void
}) {
  const bands = [
    {
      key: 'bass' as const,
      label: 'Graves',
      freq: '250 Hz',
      value: eq.bass,
    },
    {
      key: 'mid' as const,
      label: 'Medios',
      freq: '1 kHz',
      value: eq.mid,
    },
    {
      key: 'treble' as const,
      label: 'Agudos',
      freq: '3.5 kHz',
      value: eq.treble,
    },
  ]

  const hasChanges = eq.bass !== 0 || eq.mid !== 0 || eq.treble !== 0

  return (
    <div>
      <style>{thumbCss()}</style>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '.18em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.28)',
          }}
        >
          Ecualizador 3 bandas
        </p>

        {hasChanges && (
          <button
            onClick={() => setEq({ bass: 0, mid: 0, treble: 0 })}
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

      <div style={{ display: 'grid', gap: 18 }}>
        {bands.map((band) => {
          const percent = ((band.value + 18) / 36) * 100

          return (
            <div key={band.key}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                  <span
                    style={{
                      fontSize: 12,
                      color: 'rgba(255,255,255,0.72)',
                    }}
                  >
                    {band.label}
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      color: 'rgba(255,255,255,0.24)',
                    }}
                  >
                    {band.freq}
                  </span>
                </div>

                <span
                  style={{
                    fontSize: 12,
                    color: band.value !== 0 ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.24)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {band.value > 0 ? `+${band.value}` : band.value} dB
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span
                  style={{
                    width: 30,
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.22)',
                    textAlign: 'right',
                    flexShrink: 0,
                  }}
                >
                  -18
                </span>

                <input
                  className="ur-eq-range"
                  type="range"
                  min={-18}
                  max={18}
                  step={1}
                  value={band.value}
                  onChange={(e) => {
                    const next = Number(e.target.value)
                    setEq({
                      ...eq,
                      [band.key]: next,
                    })
                  }}
                  style={sliderStyle(percent)}
                />

                <span
                  style={{
                    width: 30,
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.22)',
                    flexShrink: 0,
                  }}
                >
                  +18
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}