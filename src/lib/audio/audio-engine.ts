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

  private player: Tone.Player
  private pitchShift: Tone.PitchShift
  private bass: Tone.Filter
  private mid: Tone.Filter
  private treble: Tone.Filter

  private startedAt = 0
  private pausedAt = 0
  private playing = false
  private loading = false
  private currentUrl: string | null = null

  constructor() {
    clog.log('AudioEngine', 'constructor start', {
      toneContextState: Tone.context.state,
    })

    if (Tone.context.state === 'closed') {
      Tone.setContext(new Tone.Context())
      clog.log('AudioEngine', 'new Tone.Context created')
    }

    Tone.context.lookAhead = 0.01

    this.player = new Tone.Player({
      autostart: false,
    })

    this.pitchShift = new Tone.PitchShift({
      pitch: 0,
      windowSize: 0.1,
      delayTime: 0,
      feedback: 0,
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

    this.rebuildRouting()

    clog.log('AudioEngine', 'constructor done', {
      toneContextState: Tone.context.state,
    })
  }

  private rebuildRouting() {
    try { this.player.disconnect() } catch {}
    try { this.pitchShift.disconnect() } catch {}
    try { this.bass.disconnect() } catch {}
    try { this.mid.disconnect() } catch {}
    try { this.treble.disconnect() } catch {}

    if (this.currentPitch === 0) {
      // BYPASS pitchShift completely
      this.player.connect(this.bass)
      clog.log('AudioEngine', 'routing: player -> bass -> mid -> treble')
    } else {
      this.player.connect(this.pitchShift)
      this.pitchShift.connect(this.bass)
      clog.log('AudioEngine', 'routing: player -> pitchShift -> bass -> mid -> treble', {
        pitch: this.currentPitch,
      })
    }

    this.bass.connect(this.mid)
    this.mid.connect(this.treble)
    this.treble.toDestination()
  }

  async load(url: string) {
    clog.log('AudioEngine', 'load start', {
      url,
      currentUrl: this.currentUrl,
      bufferLoaded: this.player.buffer.loaded,
      playing: this.playing,
      loading: this.loading,
    })

    if (this.currentUrl === url && this.player.buffer.loaded) {
      clog.log('AudioEngine', 'load skipped, same url already loaded', { url })
      return
    }

    if (this.playing) {
      this.pause()
    }

    this.loading = true
    this.currentUrl = url

    try {
      await this.player.load(url)
      clog.log('AudioEngine', 'load success', {
        url,
        duration: this.player.buffer.loaded ? this.player.buffer.duration : 0,
      })
    } catch (error) {
      clog.error('AudioEngine', 'load failed', {
        url,
        error: String(error),
      })
      throw error
    } finally {
      this.loading = false
    }

    this.startedAt = 0
    this.pausedAt = 0
    this.playing = false
  }

  private waitForRunning(timeoutMs = 3000): Promise<boolean> {
    const rawCtx = Tone.context.rawContext as AudioContext

    if (rawCtx.state === 'running') {
      return Promise.resolve(true)
    }

    return new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => {
        rawCtx.removeEventListener('statechange', handler)
        resolve(rawCtx.state === 'running')
      }, timeoutMs)

      const handler = () => {
        if (rawCtx.state === 'running') {
          clearTimeout(timer)
          rawCtx.removeEventListener('statechange', handler)
          resolve(true)
        }
      }

      rawCtx.addEventListener('statechange', handler)

      if (rawCtx.state === 'running') {
        clearTimeout(timer)
        rawCtx.removeEventListener('statechange', handler)
        resolve(true)
      }
    })
  }

  async play() {
    clog.log('AudioEngine', 'play start', {
      toneContextState: Tone.context.state,
      bufferLoaded: this.player.buffer.loaded,
      loading: this.loading,
      playing: this.playing,
      pausedAt: this.pausedAt,
      rate: this.rate,
      pitch: this.currentPitch,
    })

    try {
      await Tone.start()
      clog.log('AudioEngine', 'Tone.start resolved', {
        toneContextState: Tone.context.state,
      })
    } catch (error) {
      clog.error('AudioEngine', 'Tone.start failed', {
        error: String(error),
        toneContextState: Tone.context.state,
      })
      throw error
    }

    const running = await this.waitForRunning()

    clog.log('AudioEngine', 'waitForRunning result', {
      running,
      toneContextState: Tone.context.state,
    })

    if (!running) {
      clog.warn('AudioEngine', 'play aborted: context not running')
      return
    }

    if (!this.player.buffer.loaded || this.loading) {
      clog.warn('AudioEngine', 'play aborted: buffer not ready', {
        bufferLoaded: this.player.buffer.loaded,
        loading: this.loading,
      })
      return
    }

    if (this.playing) {
      clog.warn('AudioEngine', 'play skipped: already playing')
      return
    }

    this.player.playbackRate = this.rate
    this.startedAt = Tone.now() - this.pausedAt

    try {
      this.player.start(undefined, this.pausedAt)
      this.playing = true

      clog.log('AudioEngine', 'player.start called', {
        pausedAt: this.pausedAt,
        toneNow: Tone.now(),
        playerState: this.player.state,
      })
    } catch (error) {
      clog.error('AudioEngine', 'player.start failed', {
        error: String(error),
        pausedAt: this.pausedAt,
      })
      throw error
    }
  }

  pause() {
    clog.log('AudioEngine', 'pause called', {
      playing: this.playing,
      playerState: this.player.state,
    })

    if (!this.playing) return

    this.pausedAt = this.getTime()

    if (this.player.state === 'started') {
      this.player.stop()
      clog.log('AudioEngine', 'player.stop called from pause')
    }

    this.playing = false
  }

  seek(time: number) {
    const duration = this.getDuration()
    const clamped = Math.max(0, Math.min(time, duration || time))
    const wasPlaying = this.playing

    clog.log('AudioEngine', 'seek called', {
      requested: time,
      clamped,
      duration,
      wasPlaying,
      playerState: this.player.state,
    })

    if (this.player.state === 'started') {
      this.player.stop()
      clog.log('AudioEngine', 'player.stop called from seek')
    }

    this.pausedAt = clamped
    this.playing = false

    if (wasPlaying) {
      this.startedAt = Tone.now() - clamped
      this.player.start(undefined, clamped)
      this.playing = true

      clog.log('AudioEngine', 'player restarted after seek', {
        clamped,
        playerState: this.player.state,
      })
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

    clog.log('AudioEngine', 'setRate', {
      rate,
      playing: this.playing,
      playerState: this.player.state,
    })

    if (this.playing) {
      this.player.playbackRate = rate
    }
  }

  setPitch(semitones: number) {
    this.currentPitch = semitones
    this.pitchShift.pitch = semitones
    this.rebuildRouting()

    clog.log('AudioEngine', 'setPitch', { semitones })
  }

  setEq(eq: EqSettings) {
    clog.log('AudioEngine', 'setEq', eq)
    this.bass.gain.value = eq.bass
    this.mid.gain.value = eq.mid
    this.treble.gain.value = eq.treble
  }

  dispose() {
    clog.log('AudioEngine', 'dispose called')

    this.player.dispose()
    this.pitchShift.dispose()
    this.bass.dispose()
    this.mid.dispose()
    this.treble.dispose()
  }
}