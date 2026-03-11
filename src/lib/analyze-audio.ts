'use client'

import { getEssentia } from '@/lib/audio/essentia'

type AnalyzeResult = {
  key: string | null
  scale: string | null
  bpm: number | null
}

function toMono(audioBuffer: AudioBuffer): Float32Array {
  const { numberOfChannels, length } = audioBuffer

  if (numberOfChannels === 1) {
    return new Float32Array(audioBuffer.getChannelData(0))
  }

  const out = new Float32Array(length)
  const channels = Array.from({ length: numberOfChannels }, (_, i) =>
    audioBuffer.getChannelData(i)
  )

  for (let i = 0; i < length; i++) {
    let sum = 0
    for (let c = 0; c < numberOfChannels; c++) sum += channels[c][i]
    out[i] = sum / numberOfChannels
  }

  return out
}

function sliceMiddle(signal: Float32Array, sampleRate: number, seconds = 90): Float32Array {
  const wanted = Math.floor(sampleRate * seconds)
  if (signal.length <= wanted) return signal

  const start = Math.floor((signal.length - wanted) / 2)
  return signal.slice(start, start + wanted)
}

async function decodeFile(file: File): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer()
  const ctx = new AudioContext({ sampleRate: 44100 })

  try {
    return await new Promise<AudioBuffer>((resolve, reject) => {
      ctx.decodeAudioData(arrayBuffer.slice(0), resolve, reject)
    })
  } finally {
    await ctx.close().catch(() => {})
  }
}

export async function analyzeAudio(file: File): Promise<AnalyzeResult> {
  const essentia = await getEssentia()
  const audioBuffer = await decodeFile(file)

  const mono = toMono(audioBuffer)
  const signal = sliceMiddle(mono, audioBuffer.sampleRate, 90)

  const vector = essentia.arrayToVector(signal)

  try {
    const rhythm = essentia.RhythmExtractor2013(vector)
    const key = essentia.KeyExtractor(vector)

    return {
      bpm: Number.isFinite(rhythm?.bpm) ? Math.round(rhythm.bpm) : null,
      key: typeof key?.key === 'string' ? key.key : null,
      scale: typeof key?.scale === 'string' ? key.scale : null,
    }
  } finally {
    if (vector?.delete) {
      try { vector.delete() } catch {}
    }
  }
}