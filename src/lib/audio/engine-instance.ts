import * as Tone from 'tone'
import { AudioEngine } from './audio-engine'

declare global {
  interface Window {
    __appAudioEngine?: AudioEngine
  }
}

export function getAudioEngine(): AudioEngine | null {
  if (typeof window === 'undefined') return null

  if (!window.__appAudioEngine) {
    window.__appAudioEngine = new AudioEngine()
  }

  return window.__appAudioEngine
}

export async function resumeAudioContext() {
  if (typeof window === 'undefined') return

  try {
    await Tone.start()
  } catch {}

  const engine = getAudioEngine()
  if (!engine) return

  try {
    await engine.resumeContext?.()
  } catch {}
}