import * as Tone from 'tone'
import { AudioEngine } from './audio-engine'

let engine: AudioEngine | null = null

export function getAudioEngine(): AudioEngine | null {
  if (typeof window === 'undefined') return null

  if (!engine) {
    engine = new AudioEngine()
  }

  return engine
}

export async function resumeAudioContext() {
  try {
    console.log('[CLIENT LOCAL] resumeAudioContext before', Tone.context.state)
    await Tone.start()
    console.log('[CLIENT LOCAL] resumeAudioContext after', Tone.context.state)

    await fetch('/api/client-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level: 'log',
        scope: 'resumeAudioContext',
        message: 'resumeAudioContext called',
        data: { state: Tone.context.state },
      }),
      keepalive: true,
    })
  } catch (error) {
    console.error(error)
  }
}