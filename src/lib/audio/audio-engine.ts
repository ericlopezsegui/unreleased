import * as Tone from 'tone'
import { clog } from '@/lib/debug/client-log'

export type EqSettings = {
  bass: number
  mid: number
  treble: number
}

export class AudioEngine {
  private rate = 1
  private currentPitch = 0

  private player: Tone.GrainPlayer
  private bass: Tone.Filter
  private mid: Tone.Filter
  private treble: Tone.Filter

  private buffer: Tone.ToneAudioBuffer | null = null

  private startedAt = 0
  private pausedAt = 0
  private playing = false
  private loading = false
  private currentUrl: string | null = null

  private pitchShift = new Tone.PitchShift({ pitch: 0 })

  constructor() {
    clog.log('AudioEngine', 'constructor start', {
      toneContextState: Tone.context.state,
    })

    if (Tone.context.state === 'closed') {
      Tone.setContext(new Tone.Context())
      clog.log('AudioEngine', 'new Tone.Context created')
    }

    Tone.context.lookAhead = 0.01

    this.player = new Tone.GrainPlayer({
      overlap: 0.08,
      grainSize: 0.12,
      playbackRate: 1,
      detune: 0,
      loop: false,
    })

    this.bass = new Tone.Filter({
      frequency: 250,
      type: 'lowshelf',
      gain: 0,
    })

    this.mid = new Tone.Filter({
      frequency: 1000,
      type: 'peaking',
      Q: 1,
      gain: 0,
    })

    this.treble = new Tone.Filter({
      frequency: 3500,
      type: 'highshelf',
      gain: 0,
    })

    this.player.connect(this.bass)
    this.bass.connect(this.mid)
    this.mid.connect(this.treble)
    this.treble.toDestination()

    clog.log('AudioEngine', 'constructor done', {
      toneContextState: Tone.context.state,
    })
  }

  private rebuildRouting() {
    if (!this.player) return

    try { this.player.disconnect() } catch {}
    try { this.pitchShift.disconnect() } catch {}
    try { this.bass.disconnect() } catch {}
    try { this.mid.disconnect() } catch {}
    try { this.treble.disconnect() } catch {}

    if (this.currentPitch === 0) {
      this.player.connect(this.bass)
    } else {
      this.player.connect(this.pitchShift)
      this.pitchShift.connect(this.bass)
    }

    this.bass.connect(this.mid)
    this.mid.connect(this.treble)
    this.treble.toDestination()
  }

  async load(url: string) {
    if (this.currentUrl === url && this.player) return

    if (this.playing) {
      this.pause()
    }

    this.loading = true
    this.currentUrl = url

    if (this.player) {
      try {
        this.player.disconnect()
        this.player.dispose()
      } catch {}
    }

    this.player = new Tone.GrainPlayer({
      url,
      loop: false,
      grainSize: 0.12,
      overlap: 0.05,
      playbackRate: this.rate,
    })

    this.rebuildRouting()

    await Tone.loaded()

    this.startedAt = 0
    this.pausedAt = 0
    this.playing = false
    this.loading = false
  }

  async resumeContext() {
    const raw = Tone.getContext().rawContext
    if (raw.state !== 'running') {
      await Tone.start()
    }
  }

  async play() {
    if (!this.player || this.loading) return

    await Tone.start()
    await Tone.loaded()

    if (this.playing) return

    this.player.playbackRate = this.rate
    this.startedAt = Tone.now() - this.pausedAt
    this.player.start(undefined, this.pausedAt)
    this.playing = true
  }

  pause() {
    if (!this.playing) return

    this.pausedAt = this.getTime()

    if (this.player.state === 'started') {
      this.player.stop()
    }

    this.playing = false
  }

  seek(time: number) {
    const duration = this.getDuration()
    const clamped = Math.max(0, Math.min(time, duration || time))
    const wasPlaying = this.playing

    if (this.player.state === 'started') {
      this.player.stop()
    }

    this.pausedAt = clamped
    this.playing = false

    if (wasPlaying) {
      this.applyRate()
      this.applyPitch()
      this.startedAt = Tone.now() - clamped
      this.player.start(undefined, clamped)
      this.playing = true
    }
  }

  resetControls() {
    this.setRate(1)
    this.setPitch(0)
    this.setEq({ bass: 0, mid: 0, treble: 0 })
  }

  getTime() {
    if (!this.playing) return this.pausedAt
    const elapsed = Tone.now() - this.startedAt
    return Math.max(0, Math.min(elapsed, this.getDuration()))
  }

  getDuration() {
    return this.player.buffer.loaded ? this.player.buffer.duration : 0
  }

  setRate(rate: number) {
    this.rate = rate
    this.applyRate()
  }

  setPitch(semitones: number) {
    this.currentPitch = semitones
    this.applyPitch()
  }

  private applyRate() {
    this.player.playbackRate = this.rate

    if (this.rate <= 0.8) {
      this.player.grainSize = 0.14
      this.player.overlap = 0.1
    } else if (this.rate >= 1.35) {
      this.player.grainSize = 0.09
      this.player.overlap = 0.06
    } else {
      this.player.grainSize = 0.12
      this.player.overlap = 0.08
    }
  }

  private applyPitch() {
    this.player.detune = this.currentPitch * 100
  }

  setEq(eq: EqSettings) {
    this.bass.gain.value = eq.bass
    this.mid.gain.value = eq.mid
    this.treble.gain.value = eq.treble
  }

  dispose() {
    this.player.dispose()
    this.bass.dispose()
    this.mid.dispose()
    this.treble.dispose()
  }
}