const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// ─── Cooley-Tukey radix-2 in-place FFT ─────────────────────────────────────
function fft(re: Float64Array, im: Float64Array): void {
  const n = re.length
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1
    for (; j & bit; bit >>= 1) j ^= bit
    j ^= bit
    if (i < j) {
      ;[re[i], re[j]] = [re[j], re[i]]
      ;[im[i], im[j]] = [im[j], im[i]]
    }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = -2 * Math.PI / len
    const wRe = Math.cos(ang), wIm = Math.sin(ang)
    for (let i = 0; i < n; i += len) {
      let curRe = 1, curIm = 0
      for (let j = 0; j < len >> 1; j++) {
        const uRe = re[i + j], uIm = im[i + j]
        const vRe = re[i + j + (len >> 1)] * curRe - im[i + j + (len >> 1)] * curIm
        const vIm = re[i + j + (len >> 1)] * curIm + im[i + j + (len >> 1)] * curRe
        re[i + j] = uRe + vRe;              im[i + j] = uIm + vIm
        re[i + j + (len >> 1)] = uRe - vRe; im[i + j + (len >> 1)] = uIm - vIm
        const nr = curRe * wRe - curIm * wIm
        curIm = curRe * wIm + curIm * wRe
        curRe = nr
      }
    }
  }
}

// ─── Downsample mono by integer factor (averaging) ─────────────────────────
function downsampleMono(src: Float32Array, factor: number): Float32Array {
  const outLen = Math.floor(src.length / factor)
  const out = new Float32Array(outLen)
  for (let i = 0; i < outLen; i++) {
    let s = 0
    for (let j = 0; j < factor; j++) s += src[i * factor + j]
    out[i] = s / factor
  }
  return out
}

// ─── Slice AudioBuffer to mono Float32Array ─────────────────────────────────
function sliceToMono(buf: AudioBuffer, startSec: number, durationSec: number): Float32Array {
  const sr = buf.sampleRate
  const start = Math.min(Math.floor(startSec * sr), buf.length)
  const len = Math.min(Math.floor(durationSec * sr), buf.length - start)
  if (len <= 0) return new Float32Array(0)
  const nCh = buf.numberOfChannels
  const out = new Float32Array(len)
  for (let i = 0; i < len; i++) {
    let s = 0
    for (let c = 0; c < nCh; c++) s += buf.getChannelData(c)[start + i]
    out[i] = s / nCh
  }
  return out
}

// ─── Yield to browser event loop to prevent freezing on Safari ─────────────
function yieldFrame(): Promise<void> {
  return new Promise(r => setTimeout(r, 0))
}

// ─── BPM: autocorrelation + harmonic reinforcement + music-tempo validation ─

/**
 * Computes onset strength (half-wave rectified 1st difference of RMS energy)
 * and returns autocorrelation with sub/super-harmonic reinforcement.
 * This resolves the "double tempo / half tempo" confusion that library-only
 * approaches suffer from: if lag L is a true beat period, lags L/2, L/3 will
 * also be periodic, while their autocorrelation scores reinforce L's peak.
 */
function onsetACF(
  signal: Float32Array,
  sr: number,
  frameSize = 512,
  hopSize = 128,
): { bpm: number; scored: Float64Array; fps: number; minLag: number; maxLag: number } | null {
  const numFrames = Math.floor((signal.length - frameSize) / hopSize)
  if (numFrames < 10) return null

  const rms = new Float64Array(numFrames)
  for (let f = 0; f < numFrames; f++) {
    let s = 0; const off = f * hopSize
    for (let i = 0; i < frameSize; i++) { const v = signal[off + i]; s += v * v }
    rms[f] = Math.sqrt(s / frameSize)
  }

  const onset = new Float64Array(numFrames)
  for (let f = 1; f < numFrames; f++) onset[f] = Math.max(0, rms[f] - rms[f - 1])
  const onMax = onset.reduce((a, b) => Math.max(a, b), 0)
  if (onMax === 0) return null
  for (let f = 0; f < numFrames; f++) onset[f] /= onMax

  const fps = sr / hopSize
  const minLag = Math.max(1, Math.round(fps * 60 / 220))
  const maxLag = Math.min(numFrames >> 1, Math.round(fps * 60 / 50))

  const acf = new Float64Array(maxLag + 1)
  for (let lag = minLag; lag <= maxLag; lag++) {
    let s = 0; const end = onset.length - lag
    for (let f = 0; f < end; f++) s += onset[f] * onset[f + lag]
    acf[lag] = s / end
  }

  // Harmonic reinforcement: a true beat period L will have peaks at L/2, L/3 (subdivisions)
  // and at 2L (the bar). Weight them accordingly.
  const scored = new Float64Array(maxLag + 1)
  for (let lag = minLag; lag <= maxLag; lag++) {
    let s = acf[lag]
    const half = Math.round(lag / 2), third = Math.round(lag / 3)
    if (half >= minLag) s += acf[half] * 0.5
    if (third >= minLag) s += acf[third] * 0.25
    const dbl = lag * 2
    if (dbl <= maxLag) s += acf[dbl] * 0.3
    scored[lag] = s
  }

  let bestLag = minLag
  for (let lag = minLag + 1; lag <= maxLag; lag++) {
    if (scored[lag] > scored[bestLag]) bestLag = lag
  }

  return { bpm: (fps * 60) / bestLag, scored, fps, minLag, maxLag }
}

async function detectBpm(audioBuffer: AudioBuffer): Promise<number | null> {
  try {
    const srcRate = audioBuffer.sampleRate
    const mono = sliceToMono(audioBuffer, 0, 60)

    // Downsample to ~11025 Hz (beats don't need high SR)
    const factor11k = Math.max(1, Math.floor(srcRate / 11025))
    const signal = factor11k > 1 ? downsampleMono(mono, factor11k) : mono
    const sr = srcRate / factor11k

    await yieldFrame()

    const autoResult = onsetACF(signal, sr)

    await yieldFrame()

    // Cross-validate with music-tempo for cases where ACF might prefer a subdivision
    let bpmLib: number | null = null
    try {
      const MusicTempo = (await import('music-tempo')).default
      const factor22k = Math.max(1, Math.floor(srcRate / 22050))
      const signal22k = factor22k > 1 ? downsampleMono(mono, factor22k) : mono
      await yieldFrame()
      const mt = new MusicTempo(Array.from(signal22k))
      if (mt.tempo > 40 && mt.tempo < 300) bpmLib = mt.tempo
    } catch { /* music-tempo is optional */ }

    if (!autoResult && !bpmLib) return null
    if (!autoResult) return bpmLib ? Math.round(bpmLib) : null

    const bpmAuto = autoResult.bpm

    if (bpmLib !== null) {
      // Check if they agree at any octave relation (×1, ×0.5, ×2)
      for (const mul of [1, 0.5, 2]) {
        const adj = bpmLib * mul
        if (adj > 40 && adj < 300 && Math.abs(bpmAuto - adj) / bpmAuto < 0.07) {
          // Agreement: autocorrelation result is more precise (sub-sample accuracy)
          return Math.round(bpmAuto)
        }
      }
      // Disagreement: autocorrelation with harmonic reinforcement tends to be more reliable
      // for finding the "quarter note" beat vs. library which can land on eighth notes
      return Math.round(bpmAuto)
    }

    return Math.round(bpmAuto)
  } catch {
    return null
  }
}

// ─── Key: multi-segment chromagram + Krumhansl-Schmuckler ──────────────────

/**
 * Build a chroma vector from a signal segment using FFT.
 * Uses LINEAR magnitude (sqrt of power) instead of energy — this prevents
 * a few loud notes from dominating the chroma distribution, giving a more
 * representative tonal fingerprint.
 * Frequency range restricted to A1–C7 (55–2093 Hz) to avoid percussion noise.
 */
async function buildChroma(signal: Float32Array, sr: number): Promise<Float64Array> {
  const FFT_SIZE = 4096
  const HOP_SIZE = 2048
  const chroma = new Float64Array(12)

  const hann = new Float64Array(FFT_SIZE)
  for (let i = 0; i < FFT_SIZE; i++) hann[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (FFT_SIZE - 1)))

  const minBin = Math.ceil(55 * FFT_SIZE / sr)
  const maxBin = Math.min(Math.floor(2093 * FFT_SIZE / sr), FFT_SIZE >> 1)

  const numFrames = Math.floor((signal.length - FFT_SIZE) / HOP_SIZE)
  const BATCH = 16
  const re = new Float64Array(FFT_SIZE)
  const im = new Float64Array(FFT_SIZE)

  for (let fb = 0; fb < numFrames; fb += BATCH) {
    const fe = Math.min(fb + BATCH, numFrames)
    for (let f = fb; f < fe; f++) {
      const off = f * HOP_SIZE
      for (let i = 0; i < FFT_SIZE; i++) { re[i] = signal[off + i] * hann[i]; im[i] = 0 }
      fft(re, im)
      for (let k = minBin; k < maxBin; k++) {
        // LINEAR magnitude — not energy (mag²). Reduces dominance of loud peaks.
        const mag = Math.sqrt(re[k] * re[k] + im[k] * im[k])
        if (mag < 1e-7) continue
        const freq = k * sr / FFT_SIZE
        const midi = 12 * Math.log2(freq / 440) + 69
        const bin = ((Math.round(midi) % 12) + 12) % 12
        chroma[bin] += mag
      }
    }
    await yieldFrame()
  }
  return chroma
}

async function detectKey(audioBuffer: AudioBuffer): Promise<string | null> {
  try {
    const srcRate = audioBuffer.sampleRate
    const dur = audioBuffer.duration

    // Analyze 3 windows spread across the song body (skip intro/outro).
    // Using the middle portion is far more representative than always starting from 0.
    const segLen = Math.min(30, dur * 0.25)
    const segments: [number, number][] = []
    const offsets = [0.25, 0.50, 0.72]
    for (const frac of offsets) {
      const start = dur * frac
      if (start + segLen < dur) segments.push([start, segLen])
    }
    if (segments.length === 0) segments.push([0, Math.min(40, dur)])

    const factor = Math.max(1, Math.floor(srcRate / 11025))
    const sr = srcRate / factor

    // Compute per-segment chromas and L2-normalize before combining
    const combined = new Float64Array(12)
    for (const [start, length] of segments) {
      const raw = sliceToMono(audioBuffer, start, length)
      const signal = factor > 1 ? downsampleMono(raw, factor) : raw
      const wChroma = await buildChroma(signal, sr)

      let norm = 0
      for (let i = 0; i < 12; i++) norm += wChroma[i] * wChroma[i]
      norm = Math.sqrt(norm)
      if (norm > 0) for (let i = 0; i < 12; i++) combined[i] += wChroma[i] / norm
    }

    const cmax = Math.max(...combined)
    if (cmax === 0) return null
    const cn = Array.from(combined).map(v => v / cmax)

    // Krumhansl-Schmuckler key profiles
    const MAJOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]
    const MINOR = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]

    // Pearson correlation (chroma rotated so index 0 = tonic)
    const pearson = (profile: number[], shift: number): number => {
      let sx = 0, sy = 0
      for (let i = 0; i < 12; i++) { sx += cn[i]; sy += profile[(i - shift + 12) % 12] }
      const mx = sx / 12, my = sy / 12
      let num = 0, dx2 = 0, dy2 = 0
      for (let i = 0; i < 12; i++) {
        const a = cn[i] - mx, b = profile[(i - shift + 12) % 12] - my
        num += a * b; dx2 += a * a; dy2 += b * b
      }
      return dx2 > 0 && dy2 > 0 ? num / Math.sqrt(dx2 * dy2) : 0
    }

    let best = -Infinity, bestKey = ''
    for (let i = 0; i < 12; i++) {
      const maj = pearson(MAJOR, i), min = pearson(MINOR, i)
      if (maj > best) { best = maj; bestKey = `${NOTE_NAMES[i]} maj` }
      if (min > best) { best = min; bestKey = `${NOTE_NAMES[i]} min` }
    }

    return bestKey || null
  } catch {
    return null
  }
}

export async function analyzeAudio(file: File): Promise<{ bpm: number | null; key: string | null }> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 44100 })
    const audioBuffer = await new Promise<AudioBuffer>((resolve, reject) =>
      ctx.decodeAudioData(arrayBuffer.slice(0), resolve, reject)
    )
    await ctx.close()

    // Sequential execution — running in parallel saturates Safari's main thread
    const bpm = await detectBpm(audioBuffer)
    const key = await detectKey(audioBuffer)

    return { bpm, key }
  } catch {
    return { bpm: null, key: null }
  }
}
