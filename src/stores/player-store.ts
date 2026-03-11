import { create } from 'zustand'

export type PlayerTab = 'versions' | 'controls' | 'eq' | 'stems'

export type TrackVersion = {
  id: string
  label: string
  audioUrl: string
  bpm?: number | null
  key?: string | null
  createdAt?: string | null
}

export type StemTrack = {
  id: string
  label: string
  audioUrl?: string | null
  enabled?: boolean
  volume?: number
}

type OpenPayload = {
  trackId?: string | null
  trackTitle: string
  coverUrl?: string | null
  versions: TrackVersion[]
  initialVersionId?: string | null
  stems?: StemTrack[]
  queue?: Array<{
    trackId?: string | null
    trackTitle: string
    coverUrl?: string | null
    versions: TrackVersion[]
    stems?: StemTrack[]
  }>
  queueIndex?: number
}

type PlayerState = {
  isOpen: boolean
  isExpanded: boolean
  isPlaying: boolean

  trackId: string | null
  trackTitle: string | null
  coverUrl: string | null

  versions: TrackVersion[]
  currentVersionId: string | null

  stems: StemTrack[]

  queue: Array<{
    trackId?: string | null
    trackTitle: string
    coverUrl?: string | null
    versions: TrackVersion[]
    stems?: StemTrack[]
  }>
  queueIndex: number

  currentTime: number
  duration: number

  activeTab: PlayerTab

  openPlayer: (payload: OpenPayload) => void
  closePlayer: () => void
  toggleExpanded: () => void
  setExpanded: (value: boolean) => void
  setPlaying: (value: boolean) => void

  setCurrentVersion: (versionId: string) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setActiveTab: (tab: PlayerTab) => void

  nextTrack: () => void
  prevTrack: () => void
}

function getInitialVersionId(versions: TrackVersion[], initialVersionId?: string | null) {
  if (initialVersionId && versions.some(v => v.id === initialVersionId)) return initialVersionId
  return versions[0]?.id ?? null
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  isOpen: false,
  isExpanded: false,
  isPlaying: false,

  trackId: null,
  trackTitle: null,
  coverUrl: null,

  versions: [],
  currentVersionId: null,

  stems: [],

  queue: [],
  queueIndex: 0,

  currentTime: 0,
  duration: 0,

  activeTab: 'versions',

  openPlayer: (payload) => {
    const queue = payload.queue ?? [
      {
        trackId: payload.trackId ?? null,
        trackTitle: payload.trackTitle,
        coverUrl: payload.coverUrl ?? null,
        versions: payload.versions,
        stems: payload.stems ?? [],
      },
    ]

    const queueIndex = payload.queueIndex ?? 0
    const currentItem = queue[queueIndex]

    set({
      isOpen: true,
      isExpanded: false,
      isPlaying: true,

      trackId: currentItem?.trackId ?? payload.trackId ?? null,
      trackTitle: currentItem?.trackTitle ?? payload.trackTitle,
      coverUrl: currentItem?.coverUrl ?? payload.coverUrl ?? null,

      versions: currentItem?.versions ?? payload.versions,
      currentVersionId: getInitialVersionId(
        currentItem?.versions ?? payload.versions,
        payload.initialVersionId,
      ),

      stems: currentItem?.stems ?? payload.stems ?? [],

      queue,
      queueIndex,

      currentTime: 0,
      duration: 0,
      activeTab: 'versions',
    })
  },

  closePlayer: () =>
    set({
      isOpen: false,
      isExpanded: false,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      activeTab: 'versions',
    }),

  toggleExpanded: () => set((state) => ({ isExpanded: !state.isExpanded })),
  setExpanded: (value) => set({ isExpanded: value }),
  setPlaying: (value) => set({ isPlaying: value }),

  setCurrentVersion: (versionId) =>
    set((state) => {
      if (!state.versions.some(v => v.id === versionId)) return state
      return {
        currentVersionId: versionId,
        currentTime: 0,
        duration: 0,
        isPlaying: false,
      }
    }),

  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  nextTrack: () => {
    const state = get()
    if (state.queueIndex >= state.queue.length - 1) return

    const nextIndex = state.queueIndex + 1
    const item = state.queue[nextIndex]
    if (!item) return

    set({
      queueIndex: nextIndex,
      trackId: item.trackId ?? null,
      trackTitle: item.trackTitle,
      coverUrl: item.coverUrl ?? null,
      versions: item.versions,
      currentVersionId: getInitialVersionId(item.versions),
      stems: item.stems ?? [],
      currentTime: 0,
      duration: 0,
      isPlaying: false,
      activeTab: 'versions',
    })
  },

  prevTrack: () => {
    const state = get()
    if (state.queueIndex <= 0) return

    const prevIndex = state.queueIndex - 1
    const item = state.queue[prevIndex]
    if (!item) return

    set({
      queueIndex: prevIndex,
      trackId: item.trackId ?? null,
      trackTitle: item.trackTitle,
      coverUrl: item.coverUrl ?? null,
      versions: item.versions,
      currentVersionId: getInitialVersionId(item.versions),
      stems: item.stems ?? [],
      currentTime: 0,
      duration: 0,
      isPlaying: false,
      activeTab: 'versions',
    })
  },
}))