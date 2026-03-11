import * as Tone from 'tone'
import { clog } from '@/lib/debug/client-log'

export type EqSettings = {
  bass: number
  mid: number
  treble: number
}

type StemNode = {
  player: Tone.GrainPlayer
  gain: Tone.Volume
  volume: number
  muted: boolean
  solo: boolean
}

export class AudioEngine {
  private rate = 1
  private currentPitch = 0

  private player: Tone.GrainPlayer
  private bass: Tone.Filter
  private mid: Tone.Filter
  private treble: Tone.Filter
  private pitchShift: Tone.PitchShift

  private masterInput: Tone.Gain
  private mainGain: Tone.Volume

  private startedAt = 0
  private pausedAt = 0
  private playing = false
  private loading = false
  private currentUrl: string | null = null

  private stems = new Map<string, StemNode>()

  constructor() {
    clog.log('AudioEngine', 'constructor start', {
      toneContextState: Tone.context.state,
    })

    if (Tone.context.state === 'closed') {
      Tone.setContext(new Tone.Context())
      clog.log('AudioEngine', 'new Tone.Context created')
    }

    Tone.context.lookAhead = 0.01

    this.masterInput = new Tone.Gain(1)
    this.mainGain = new Tone.Volume(0)

    this.pitchShift = new Tone.PitchShift({ pitch: 0 })

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

    this.player = this.createMainPlayer()

    this.rebuildRouting()

    clog.log('AudioEngine', 'constructor done', {
      toneContextState: Tone.context.state,
    })
  }

  private createMainPlayer(url?: string) {
    const player = new Tone.GrainPlayer({
      url,
      overlap: 0.08,
      grainSize: 0.12,
      playbackRate: this.rate,
      detune: 0,
      loop: false,
    })

    player.connect(this.mainGain)
    return player
  }

  private rebuildRouting() {
    try { this.mainGain.disconnect() } catch {}
    try { this.masterInput.disconnect() } catch {}
    try { this.pitchShift.disconnect() } catch {}
    try { this.bass.disconnect() } catch {}
    try { this.mid.disconnect() } catch {}
    try { this.treble.disconnect() } catch {}

    this.mainGain.connect(this.masterInput)

    if (this.currentPitch === 0) {
      this.masterInput.connect(this.bass)
    } else {
      this.masterInput.connect(this.pitchShift)
      this.pitchShift.connect(this.bass)
    }

    this.bass.connect(this.mid)
    this.mid.connect(this.treble)
    this.treble.toDestination()
  }

  private updateMainGainState() {
    const hasStems = this.stems.size > 0
    this.mainGain.volume.value = hasStems ? -Infinity : 0
  }

  async load(url: string) {
    clog.log('AudioEngine', 'load start', {
      url,
      currentUrl: this.currentUrl,
      playing: this.playing,
      loading: this.loading,
      stemsCount: this.stems.size,
    })

    if (this.currentUrl === url && this.player) return

    if (this.playing) {
      this.pause()
    }

    this.clearStems()

    this.loading = true
    this.currentUrl = url

    try {
      if (this.player) {
        try {
          if (this.player.state === 'started') this.player.stop()
        } catch {}
        try {
          this.player.disconnect()
          this.player.dispose()
        } catch {}
      }

      this.player = this.createMainPlayer(url)
      this.applyRate()
      this.applyPitch()
      this.rebuildRouting()
      this.updateMainGainState()

      await Tone.loaded()

      this.startedAt = 0
      this.pausedAt = 0
      this.playing = false

      clog.log('AudioEngine', 'load success', {
        url,
        duration: this.getDuration(),
      })
    } finally {
      this.loading = false
    }
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

    this.applyRate()
    this.applyPitch()
    this.updateMainGainState()

    this.startedAt = Tone.now() - this.pausedAt

    try {
      this.player.start(undefined, this.pausedAt)
    } catch {}

    for (const stem of this.stems.values()) {
      try {
        if (stem.player.loaded) {
          stem.player.playbackRate = this.rate
          stem.player.start(undefined, this.pausedAt)
        }
      } catch {}
    }

    this.playing = true
  }

  pause() {
    if (!this.playing) return

    this.pausedAt = this.getTime()

    try {
      if (this.player.state === 'started') this.player.stop()
    } catch {}

    for (const stem of this.stems.values()) {
      try {
        if (stem.player.state === 'started') stem.player.stop()
      } catch {}
    }

    this.playing = false
  }

  seek(time: number) {
    const duration = this.getDuration()
    const clamped = Math.max(0, Math.min(time, duration || time))
    const wasPlaying = this.playing

    try {
      if (this.player.state === 'started') this.player.stop()
    } catch {}

    for (const stem of this.stems.values()) {
      try {
        if (stem.player.state === 'started') stem.player.stop()
      } catch {}
    }

    this.pausedAt = clamped
    this.playing = false

    if (!wasPlaying) return

    this.applyRate()
    this.applyPitch()
    this.updateMainGainState()

    this.startedAt = Tone.now() - clamped

    try {
      this.player.start(undefined, clamped)
    } catch {}

    for (const stem of this.stems.values()) {
      try {
        if (stem.player.loaded) {
          stem.player.playbackRate = this.rate
          stem.player.start(undefined, clamped)
        }
      } catch {}
    }

    this.playing = true
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
    if (this.player?.buffer?.loaded) return this.player.buffer.duration

    for (const stem of this.stems.values()) {
      if (stem.player?.buffer?.loaded) return stem.player.buffer.duration
    }

    return 0
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

    for (const stem of this.stems.values()) {
      try {
        stem.player.playbackRate = this.rate

        if (this.rate <= 0.8) {
          stem.player.grainSize = 0.14
          stem.player.overlap = 0.1
        } else if (this.rate >= 1.35) {
          stem.player.grainSize = 0.09
          stem.player.overlap = 0.06
        } else {
          stem.player.grainSize = 0.12
          stem.player.overlap = 0.08
        }
      } catch {}
    }
  }

  private applyPitch() {
    // No dupliques el pitch:
    this.player.detune = 0

    this.pitchShift.pitch = this.currentPitch
    this.rebuildRouting()

    for (const stem of this.stems.values()) {
      try {
        stem.player.detune = 0
      } catch {}
    }
  }

  setEq(eq: EqSettings) {
    this.bass.gain.value = eq.bass
    this.mid.gain.value = eq.mid
    this.treble.gain.value = eq.treble
  }

  // ── Stem management ─────────────────────────────────────────────

  async loadStem(id: string, url: string): Promise<void> {
    this.disposeStemById(id)

    const gain = new Tone.Volume(0)
    gain.connect(this.masterInput)

    const player = new Tone.GrainPlayer({
      url,
      loop: false,
      grainSize: 0.12,
      overlap: 0.08,
      playbackRate: this.rate,
    })

    player.connect(gain)

    await Tone.loaded()

    this.stems.set(id, {
      player,
      gain,
      volume: 1,
      muted: false,
      solo: false,
    })

    this.updateMainGainState()
    this.updateAllStemGains()

    if (this.playing) {
      try {
        player.start(undefined, this.getTime())
      } catch {}
    }
  }

  async loadStems(stems: Array<{ id: string; audioUrl: string }>): Promise<void> {
    this.clearStems()

    for (const stem of stems) {
      if (!stem.audioUrl) continue
      await this.loadStem(stem.id, stem.audioUrl)
    }

    this.updateMainGainState()
    this.updateAllStemGains()
  }

  private disposeStemById(id: string): void {
    const stem = this.stems.get(id)
    if (!stem) return

    try {
      if (stem.player.state === 'started') stem.player.stop()
    } catch {}

    try { stem.player.disconnect() } catch {}
    try { stem.gain.disconnect() } catch {}
    try { stem.player.dispose() } catch {}
    try { stem.gain.dispose() } catch {}

    this.stems.delete(id)
    this.updateMainGainState()
  }

  clearStems(): void {
    for (const id of [...this.stems.keys()]) {
      this.disposeStemById(id)
    }

    this.updateMainGainState()
  }

  setStemVolume(id: string, volume: number): void {
    const stem = this.stems.get(id)
    if (!stem) return
    stem.volume = volume
    this.updateAllStemGains()
  }

  setStemMuted(id: string, muted: boolean): void {
    const stem = this.stems.get(id)
    if (!stem) return
    stem.muted = muted
    this.updateAllStemGains()
  }

  toggleStemMute(id: string): void {
    const stem = this.stems.get(id)
    if (!stem) return
    stem.muted = !stem.muted
    this.updateAllStemGains()
  }

  setStemSolo(id: string, solo: boolean): void {
    const stem = this.stems.get(id)
    if (!stem) return
    stem.solo = solo
    this.updateAllStemGains()
  }

  toggleStemSolo(id: string): void {
    const stem = this.stems.get(id)
    if (!stem) return
    stem.solo = !stem.solo
    this.updateAllStemGains()
  }

  getStemState(id: string) {
    const stem = this.stems.get(id)
    if (!stem) return null

    return {
      volume: stem.volume,
      muted: stem.muted,
      solo: stem.solo,
    }
  }

  private updateAllStemGains(): void {
    const anySolo = [...this.stems.values()].some(s => s.solo)

    for (const stem of this.stems.values()) {
      const silenced = stem.muted || (anySolo && !stem.solo)

      if (silenced || stem.volume <= 0) {
        stem.gain.volume.value = -Infinity
      } else {
        stem.gain.volume.value = Tone.gainToDb(stem.volume)
      }
    }
  }

  dispose() {
    this.clearStems()

    try { this.player.dispose() } catch {}
    try { this.mainGain.dispose() } catch {}
    try { this.masterInput.dispose() } catch {}
    try { this.bass.dispose() } catch {}
    try { this.mid.dispose() } catch {}
    try { this.treble.dispose() } catch {}
    try { this.pitchShift.dispose() } catch {}
  }
}