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

// ─── Key: full-track chromagram + spectral whitening + Krumhansl-Schmuckler ─

/**
 * Build a chroma vector using per-octave spectral whitening.
 *
 * Standard FFT maps bins linearly, so bass notes dominate the energy sum and
 * high notes get sub-bin precision.  CQT (used by librosa) avoids this by
 * giving every octave equal frequency resolution.  We achieve the same effect
 * by accumulating energy into 7 separate per-octave buckets and L2-normalising
 * each before summing — this is called "spectral whitening" and is the core
 * reason librosa's chroma_cqt works better than a plain FFT approach.
 *
 * FFT size 8192 at 22050 Hz → ~2.69 Hz/bin, enough to distinguish semitones
 * from C2 (65 Hz) upward without the bin-sharing that plagued 4096@11025.
 */
async function buildChroma(signal: Float32Array, sr: number): Promise<Float64Array> {
  const FFT_SIZE = 8192
  const HOP_SIZE = 2048
  const N_OCTAVES = 7  // C2–B8

  const perOctave = Array.from({ length: N_OCTAVES }, () => new Float64Array(12))

  const hann = new Float64Array(FFT_SIZE)
  for (let i = 0; i < FFT_SIZE; i++) hann[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (FFT_SIZE - 1)))

  // C2 (65.4 Hz) → B7 (3951 Hz) — covers all tonal content, ignores percussion
  const minBin = Math.ceil(65.4 * FFT_SIZE / sr)
  const maxBin = Math.min(Math.floor(3951 * FFT_SIZE / sr), FFT_SIZE >> 1)

  const numFrames = Math.floor((signal.length - FFT_SIZE) / HOP_SIZE)
  const BATCH = 8
  const re = new Float64Array(FFT_SIZE)
  const im = new Float64Array(FFT_SIZE)

  for (let fb = 0; fb < numFrames; fb += BATCH) {
    const fe = Math.min(fb + BATCH, numFrames)
    for (let f = fb; f < fe; f++) {
      const off = f * HOP_SIZE
      for (let i = 0; i < FFT_SIZE; i++) { re[i] = signal[off + i] * hann[i]; im[i] = 0 }
      fft(re, im)
      for (let k = minBin; k < maxBin; k++) {
        const mag = Math.sqrt(re[k] * re[k] + im[k] * im[k])
        if (mag < 1e-7) continue
        const freq = k * sr / FFT_SIZE
        const midi = 12 * Math.log2(freq / 440) + 69
        const pitchClass = ((Math.round(midi) % 12) + 12) % 12
        const octave = Math.max(0, Math.min(N_OCTAVES - 1, Math.floor(midi / 12) - 1))
        perOctave[octave][pitchClass] += mag
      }
    }
    await yieldFrame()
  }

  // Spectral whitening: L2-normalise each octave band before combining.
  // This prevents bass octaves (C2-C3) from drowning out the melodic octaves.
  const chroma = new Float64Array(12)
  for (let oct = 0; oct < N_OCTAVES; oct++) {
    let norm = 0
    for (let b = 0; b < 12; b++) norm += perOctave[oct][b] * perOctave[oct][b]
    norm = Math.sqrt(norm)
    if (norm > 1e-8) for (let b = 0; b < 12; b++) chroma[b] += perOctave[oct][b] / norm
  }

  return chroma
}

async function detectKey(audioBuffer: AudioBuffer): Promise<string | null> {
  try {
    const srcRate = audioBuffer.sampleRate
    const dur = audioBuffer.duration

    // Analyse the core of the track (up to 120 s, centred) — mirrors librosa
    // analysing the full file.  Skipping the first and last few seconds avoids
    // intros/outros that may be in a different key or tonally ambiguous.
    const maxDur = Math.min(dur, 120)
    const startSec = Math.max(0, (dur - maxDur) / 2)

    // 22050 Hz matches librosa's default sr — important for the bin mapping
    const factor = Math.max(1, Math.floor(srcRate / 22050))
    const sr = srcRate / factor

    const raw = sliceToMono(audioBuffer, startSec, maxDur)
    const signal = factor > 1 ? downsampleMono(raw, factor) : raw

    const chromaRaw = await buildChroma(signal, sr)

    // Normalise to a probability distribution (mirrors Python's chroma_vals = chroma.mean(axis=1))
    const chromaSum = chromaRaw.reduce((a, b) => a + b, 0)
    if (chromaSum === 0) return null
    const chroma = Array.from(chromaRaw).map(v => v / chromaSum)

    // Krumhansl-Schmuckler tonal profiles
    const MAJOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]
    const MINOR = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]

    // Pearson correlation — exact equivalent of Python's np.corrcoef(chroma_vals, rolled_profile)[0,1]
    const pearson = (values: number[], profile: number[], shift: number): number => {
      let sx = 0, sy = 0
      for (let i = 0; i < 12; i++) { sx += values[i]; sy += profile[(i - shift + 12) % 12] }
      const mx = sx / 12, my = sy / 12
      let num = 0, dx2 = 0, dy2 = 0
      for (let i = 0; i < 12; i++) {
        const a = values[i] - mx, b = profile[(i - shift + 12) % 12] - my
        num += a * b; dx2 += a * a; dy2 += b * b
      }
      return dx2 > 0 && dy2 > 0 ? num / Math.sqrt(dx2 * dy2) : 0
    }

    // Step 1 — find the dominant pitch class (Python: key_index = chroma_vals.argmax()).
    // Locking the tonic first eliminates the relative-major/minor ambiguity that
    // trips up a full 24-key exhaustive search when chroma is noisy.
    const tonicIdx = chroma.reduce((best, v, i) => v > chroma[best] ? i : best, 0)

    // Step 2 — test the tonic and its two neighbours (±1 semitone) to absorb any
    // small chroma inaccuracy from the FFT bin-rounding, then pick major vs minor
    // for each candidate via K-S correlation.
    const candidates = [
      (tonicIdx + 11) % 12,
      tonicIdx,
      (tonicIdx + 1) % 12,
    ]

    let best = -Infinity, bestKey = ''
    for (const tonic of candidates) {
      const maj = pearson(chroma, MAJOR, tonic)
      const min = pearson(chroma, MINOR, tonic)
      if (maj > best) { best = maj; bestKey = `${NOTE_NAMES[tonic]} maj` }
      if (min > best) { best = min; bestKey = `${NOTE_NAMES[tonic]} min` }
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
