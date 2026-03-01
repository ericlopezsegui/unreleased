import { create } from 'zustand'

export interface PlayerVersion {
  id: string
  label: string
  audioUrl: string
  bpm: number | null
  key: string | null
}

interface PlayerState {
  trackId: string | null
  trackTitle: string | null
  coverUrl: string | null
  versions: PlayerVersion[]
  currentVersionId: string | null
  isOpen: boolean
  isExpanded: boolean
  isPlaying: boolean

  loadTrack: (data: {
    trackId: string
    trackTitle: string
    coverUrl: string | null
    versions: PlayerVersion[]
    initialVersionId: string
  }) => void
  setCurrentVersion: (id: string) => void
  close: () => void
  toggleExpanded: () => void
  setPlaying: (v: boolean) => void
}

export const usePlayerStore = create<PlayerState>((set) => ({
  trackId: null,
  trackTitle: null,
  coverUrl: null,
  versions: [],
  currentVersionId: null,
  isOpen: false,
  isExpanded: false,
  isPlaying: false,

  loadTrack: (data) =>
    set({
      trackId: data.trackId,
      trackTitle: data.trackTitle,
      coverUrl: data.coverUrl,
      versions: data.versions,
      currentVersionId: data.initialVersionId,
      isOpen: true,
      isExpanded: false,
      isPlaying: true,
    }),

  setCurrentVersion: (id) => set({ currentVersionId: id, isPlaying: true }),

  close: () => set({ isOpen: false, isPlaying: false }),

  toggleExpanded: () => set((s) => ({ isExpanded: !s.isExpanded })),

  setPlaying: (v) => set({ isPlaying: v }),
}))
