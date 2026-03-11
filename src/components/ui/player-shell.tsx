'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { usePlayerStore } from '@/stores/player-store'
import { PlayerExpanded } from './player-expanded'
import { PlayerMini } from './player-mini'
import { getAudioEngine, resumeAudioContext } from '@/lib/audio/engine-instance'

export function PlayerShell() {
  const audioEngine = useMemo(() => getAudioEngine(), [])

  const {
    isOpen,
    isExpanded,
    isPlaying,
    trackTitle,
    coverUrl,
    versions,
    currentVersionId,
    stems,
    queue,
    queueIndex,
    currentTime,
    duration,
    activeTab,
    closePlayer,
    toggleExpanded,
    setPlaying,
    setCurrentVersion,
    setCurrentTime,
    setDuration,
    setActiveTab,
    nextTrack,
    prevTrack,
  } = usePlayerStore()

  const [appear, setAppear] = useState(false)
  const [rate, setRate] = useState(1)
  const [pitch, setPitch] = useState(0)
  const [eq, setEq] = useState({ bass: 0, mid: 0, treble: 0 })

  const currentVersion = useMemo(
    () => versions.find((v) => v.id === currentVersionId) ?? null,
    [versions, currentVersionId],
  )

  const audioUrl = currentVersion?.audioUrl ?? null
  const progress = duration > 0 ? currentTime / duration : 0

  const resetPlaybackControls = useCallback(() => {
    setRate(1)
    setPitch(0)
    setEq({ bass: 0, mid: 0, treble: 0 })
    setActiveTab('versions')
    audioEngine?.resetControls()
  }, [audioEngine, setActiveTab])

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => requestAnimationFrame(() => setAppear(true)))
    } else {
      setAppear(false)
    }
  }, [isOpen])

  // Reset total al cerrar el reproductor
  useEffect(() => {
    if (!audioEngine) return

    if (!isOpen) {
      audioEngine.pause()
      audioEngine.seek(0)
      resetPlaybackControls()
      setCurrentTime(0)
      setDuration(0)
    }
  }, [audioEngine, isOpen, resetPlaybackControls, setCurrentTime, setDuration])

  // Reset al cambiar canción o versión
  useEffect(() => {
    if (!audioUrl) return

    resetPlaybackControls()
    setCurrentTime(0)
    setDuration(0)
  }, [audioUrl, currentVersionId, resetPlaybackControls, setCurrentTime, setDuration])

  useEffect(() => {
    if (!audioEngine) return

    let rafId = 0
    let cancelled = false

    const loop = () => {
      if (cancelled) return

      const t = audioEngine.getTime()
      const d = audioEngine.getDuration()

      setCurrentTime(Number.isFinite(t) ? t : 0)
      setDuration(Number.isFinite(d) ? d : 0)

      if (isPlaying && d > 0 && t >= d) {
        if (queueIndex < queue.length - 1) {
          nextTrack()
        } else {
          setPlaying(false)
          setCurrentTime(0)
        }
      }

      rafId = requestAnimationFrame(loop)
    }

    rafId = requestAnimationFrame(loop)

    return () => {
      cancelled = true
      cancelAnimationFrame(rafId)
    }
  }, [audioEngine, isPlaying, queueIndex, queue.length, nextTrack, setPlaying, setCurrentTime, setDuration])

  useEffect(() => {
    if (!audioEngine) return

    if (!audioUrl) {
      setCurrentTime(0)
      setDuration(0)
      return
    }

    let cancelled = false

    const load = async () => {
      try {
        await audioEngine.load(audioUrl)

        if (cancelled) return

        setCurrentTime(0)

        const d = audioEngine.getDuration()
        setDuration(Number.isFinite(d) ? d : 0)

        audioEngine.setRate(1)
        audioEngine.setPitch(0)
        audioEngine.setEq({ bass: 0, mid: 0, treble: 0 })

        if (usePlayerStore.getState().isPlaying) {
          try {
            await audioEngine.play()
          } catch {
            setPlaying(false)
          }
        }
      } catch {
        setPlaying(false)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [audioEngine, audioUrl, setCurrentTime, setDuration, setPlaying])

  useEffect(() => {
    if (!audioEngine || !audioUrl) return

    if (isPlaying) {
      audioEngine.play().catch(() => setPlaying(false))
    } else {
      audioEngine.pause()
    }
  }, [audioEngine, audioUrl, isPlaying, setPlaying])

  useEffect(() => {
    audioEngine?.setRate(rate)
  }, [audioEngine, rate])

  useEffect(() => {
    audioEngine?.setPitch(pitch)
  }, [audioEngine, pitch])

  useEffect(() => {
    audioEngine?.setEq(eq)
  }, [audioEngine, eq])

  if (!audioEngine || !isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'calc(64px + env(safe-area-inset-bottom, 0px) + 10px)',
        left: '50%',
        transform: appear ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(130%)',
        width: 'calc(100vw - 32px)',
        maxWidth: 520,
        zIndex: 199,
        fontFamily: 'Outfit, sans-serif',
        transition: 'transform .42s cubic-bezier(0.32,0.72,0,1)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <PlayerExpanded
        rate={rate}
        pitch={pitch}
        setRate={setRate}
        setPitch={setPitch}
        isVisible={isExpanded}
        trackTitle={trackTitle}
        coverUrl={coverUrl}
        version={currentVersion ?? undefined}
        versions={versions}
        stems={stems}
        queueIndex={queueIndex}
        queueLength={queue.length}
        currentTime={currentTime}
        duration={duration}
        progress={progress}
        activeTab={activeTab}
        audioUrl={audioUrl}
        isPlaying={isPlaying}
        onDismiss={toggleExpanded}
        onSeek={(p) => {
          if (!duration) return
          const nextTime = p * duration
          audioEngine.seek(nextTime)
          setCurrentTime(nextTime)
        }}
        onTogglePlay={() => {
          void resumeAudioContext()
          setPlaying(!isPlaying)
        }}
        onPrev={prevTrack}
        onNext={nextTrack}
        onSelectVersion={setCurrentVersion}
        onChangeTab={setActiveTab}
      />

      <PlayerMini
        trackTitle={trackTitle}
        versionLabel={currentVersion?.label}
        coverUrl={coverUrl}
        progress={progress}
        audioUrl={audioUrl}
        isPlaying={isPlaying}
        canGoNext={queue.length > 1 && queueIndex < queue.length - 1}
        onToggleExpanded={toggleExpanded}
        onTogglePlay={() => {
          void resumeAudioContext()
          setPlaying(!isPlaying)
        }}
        onNext={nextTrack}
        onClose={() => {
          audioEngine.pause()
          audioEngine.seek(0)
          resetPlaybackControls()
          setCurrentTime(0)
          setDuration(0)
          closePlayer()
        }}
        onSeek={(p) => {
          if (!duration) return
          const nextTime = p * duration
          audioEngine.seek(nextTime)
          setCurrentTime(nextTime)
        }}
      />
    </div>
  )
}