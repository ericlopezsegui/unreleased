import { create } from 'zustand'

export interface PlayerVersion {
  id: string
  label: string
  audioUrl: string
  bpm: number | null
  key: string | null
}

export interface QueueItem {
  trackId: string
  trackTitle: string
  coverUrl: string | null
  versions: PlayerVersion[]
  initialVersionId: string
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
  queue: QueueItem[]
  queueIndex: number

  loadTrack: (data: {
    trackId: string
    trackTitle: string
    coverUrl: string | null
    versions: PlayerVersion[]
    initialVersionId: string
  }) => void
  loadQueue: (items: QueueItem[], startIndex: number) => void
  nextTrack: () => void
  prevTrack: () => void
  setCurrentVersion: (id: string) => void
  close: () => void
  toggleExpanded: () => void
  setPlaying: (v: boolean) => void
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  trackId: null,
  trackTitle: null,
  coverUrl: null,
  versions: [],
  currentVersionId: null,
  isOpen: false,
  isExpanded: false,
  isPlaying: false,
  queue: [],
  queueIndex: 0,

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
      queue: [{ trackId: data.trackId, trackTitle: data.trackTitle, coverUrl: data.coverUrl, versions: data.versions, initialVersionId: data.initialVersionId }],
      queueIndex: 0,
    }),

  loadQueue: (items, startIndex) => {
    if (items.length === 0) return
    const idx = Math.max(0, Math.min(startIndex, items.length - 1))
    const item = items[idx]
    set({
      trackId: item.trackId,
      trackTitle: item.trackTitle,
      coverUrl: item.coverUrl,
      versions: item.versions,
      currentVersionId: item.initialVersionId,
      isOpen: true,
      isExpanded: false,
      isPlaying: true,
      queue: items,
      queueIndex: idx,
    })
  },

  nextTrack: () => {
    const { queue, queueIndex } = get()
    const nextIdx = queueIndex + 1
    if (nextIdx >= queue.length) return
    const item = queue[nextIdx]
    set({ trackId: item.trackId, trackTitle: item.trackTitle, coverUrl: item.coverUrl, versions: item.versions, currentVersionId: item.initialVersionId, isPlaying: true, queueIndex: nextIdx })
  },

  prevTrack: () => {
    const { queue, queueIndex } = get()
    const prevIdx = queueIndex - 1
    if (prevIdx < 0) return
    const item = queue[prevIdx]
    set({ trackId: item.trackId, trackTitle: item.trackTitle, coverUrl: item.coverUrl, versions: item.versions, currentVersionId: item.initialVersionId, isPlaying: true, queueIndex: prevIdx })
  },

  setCurrentVersion: (id) => set({ currentVersionId: id, isPlaying: true }),

  close: () => set({ isOpen: false, isPlaying: false, queue: [], queueIndex: 0 }),

  toggleExpanded: () => set((s) => ({ isExpanded: !s.isExpanded })),

  setPlaying: (v) => set({ isPlaying: v }),
}))
