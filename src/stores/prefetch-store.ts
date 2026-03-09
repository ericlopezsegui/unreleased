import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

/* ─── Shared types ─── */
export interface Profile { display_name: string | null; avatar_path: string | null; theme: string; onboarding_completed: boolean }
export interface Artist { id: string; name: string; handle: string | null; avatar_path: string | null; bio: string | null; owner_user_id: string }
export interface Album { id: string; title: string; description: string | null; cover_path: string | null; is_archived: boolean; updated_at: string; track_count: number }
export interface Track { id: string; title: string; description: string | null; cover_path: string | null; album_id: string | null; position: number | null; updated_at: string; artist_id: string; albums: { title: string; cover_path: string | null } | null }
export interface Version { id: string; track_id: string; label: string; notes: string | null; audio_path: string | null; bpm: number | null; key: string | null; is_active: boolean; created_at: string }
export interface Member { artist_id: string; user_id: string; role: string; profile?: { display_name: string | null; avatar_path: string | null } }

interface PrefetchState {
  ready: boolean
  userId: string | null
  email: string | null
  artistId: string | null
  profile: Profile | null
  artist: Artist | null
  albums: Album[]
  tracks: Track[]
  versions: Version[]            // ALL versions across all tracks
  members: Member[]
  coverUrls: Record<string, string>    // keyed by album/track id
  audioUrls: Record<string, string>    // keyed by version id
  avatarUrl: string | null             // user avatar
  artistAvatarUrl: string | null       // artist avatar
  memberAvatarUrls: Record<string, string>  // keyed by user_id

  // Actions
  prefetch: () => Promise<void>
  invalidate: () => void
  // Granular mutations (to update store after edits without full reload)
  setProfile: (p: Partial<Profile>) => void
  setArtist: (a: Partial<Artist>) => void
  updateAlbum: (id: string, data: Partial<Album>) => void
  addAlbum: (a: Album) => void
  updateTrack: (id: string, data: Partial<Track>) => void
  addTrack: (t: Track) => void
  updateVersion: (id: string, data: Partial<Version>) => void
  addVersion: (v: Version) => void
  setCoverUrl: (id: string, url: string) => void
  setAudioUrl: (versionId: string, url: string) => void
  setAvatarUrl: (url: string | null) => void
  setArtistAvatarUrl: (url: string | null) => void
}

export const usePrefetchStore = create<PrefetchState>((set, get) => ({
  ready: false,
  userId: null,
  email: null,
  artistId: null,
  profile: null,
  artist: null,
  albums: [],
  tracks: [],
  versions: [],
  members: [],
  coverUrls: {},
  audioUrls: {},
  avatarUrl: null,
  artistAvatarUrl: null,
  memberAvatarUrls: {},

  prefetch: async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    /* 1. Profile + artist membership */
    const [profileRes, membershipRes] = await Promise.all([
      supabase.from('profiles').select('display_name,avatar_path,theme,onboarding_completed').eq('user_id', user.id).single(),
      supabase.from('artist_members').select('artist_id').eq('user_id', user.id).order('created_at').limit(1).single(),
    ])

    const profile = profileRes.data as Profile | null
    const artistId = membershipRes.data?.artist_id as string | null

    if (!profile || !artistId) {
      // User exists but hasn't completed setup — store minimal info so redirect logic works
      set({ ready: true, userId: user.id, email: user.email ?? null, profile })
      return
    }

    /* 2. Artist info + all data in parallel */
    const [artistRes, albumsRes, tracksRes, membersRes] = await Promise.all([
      supabase.from('artists').select('id,name,handle,avatar_path,bio,owner_user_id').eq('id', artistId).single(),
      supabase.from('albums').select('id,title,description,cover_path,is_archived,updated_at').eq('artist_id', artistId).order('updated_at', { ascending: false }),
      supabase.from('tracks').select('id,title,description,cover_path,album_id,position,updated_at,artist_id,albums(title,cover_path)').eq('artist_id', artistId).order('updated_at', { ascending: false }),
      supabase.rpc('get_artist_member_profiles', { aid: artistId }),
    ])

    const artist = artistRes.data as Artist | null
    const albumList = (albumsRes.data ?? []) as Album[]
    const trackList = (tracksRes.data ?? []) as unknown as Track[]
    const memberList = ((membersRes.data ?? []) as { user_id: string; role: string; display_name: string | null; avatar_path: string | null }[])
      .map(m => ({ artist_id: artistId, user_id: m.user_id, role: m.role, profile: { display_name: m.display_name, avatar_path: m.avatar_path } })) as Member[]

    // Compute track counts per album
    const countMap: Record<string, number> = {}
    trackList.forEach(t => { if (t.album_id) countMap[t.album_id] = (countMap[t.album_id] ?? 0) + 1 })
    albumList.forEach(a => { a.track_count = countMap[a.id] ?? 0 })

    /* 3. All versions for all tracks */
    const trackIds = trackList.map(t => t.id)
    let allVersions: Version[] = []
    if (trackIds.length > 0) {
      const { data: vData } = await supabase
        .from('track_versions')
        .select('id,track_id,label,notes,audio_path,bpm,key,is_active,created_at')
        .in('track_id', trackIds)
        .order('created_at', { ascending: false })
      allVersions = (vData ?? []) as Version[]
    }

    /* 4. Signed URLs — covers, audio, avatars — all in parallel */
    const coverUrls: Record<string, string> = {}
    const audioUrls: Record<string, string> = {}
    let avatarUrl: string | null = null
    let artistAvatarUrl: string | null = null
    const memberAvatarUrls: Record<string, string> = {}

    // Gather all URL requests
    type UrlReq = { key: string; bucket: string; path: string; ttl: number; target: 'cover' | 'audio' | 'avatar' | 'artistAvatar' | 'memberAvatar' }
    const reqs: UrlReq[] = []

    // Album covers
    albumList.forEach(a => { if (a.cover_path) reqs.push({ key: a.id, bucket: 'covers', path: a.cover_path, ttl: 3600, target: 'cover' }) })

    // Track covers (own cover, or fallback to album cover which we already fetched above)
    trackList.forEach(t => {
      const coverPath = t.cover_path ?? (t.albums as any)?.cover_path ?? null
      if (coverPath && !reqs.find(r => r.target === 'cover' && r.key === t.id)) {
        reqs.push({ key: t.id, bucket: 'covers', path: coverPath, ttl: 3600, target: 'cover' })
      }
    })

    // Audio signed URLs for all versions with audio
    allVersions.forEach(v => { if (v.audio_path) reqs.push({ key: v.id, bucket: 'audio', path: v.audio_path, ttl: 3600, target: 'audio' }) })

    // User avatar
    if (profile.avatar_path) reqs.push({ key: 'avatar', bucket: 'avatars', path: profile.avatar_path, ttl: 86400, target: 'avatar' })

    // Artist avatar
    if (artist?.avatar_path) reqs.push({ key: 'artistAvatar', bucket: 'avatars', path: artist.avatar_path, ttl: 86400, target: 'artistAvatar' })

    // Member avatars
    memberList.forEach(m => {
      if (m.profile?.avatar_path) reqs.push({ key: m.user_id, bucket: 'avatars', path: m.profile.avatar_path, ttl: 86400, target: 'memberAvatar' })
    })

    // Fire all signed URL requests concurrently in batches of 20 to avoid overwhelming the client
    const BATCH = 20
    for (let i = 0; i < reqs.length; i += BATCH) {
      const batch = reqs.slice(i, i + BATCH)
      const results = await Promise.all(batch.map(r => supabase.storage.from(r.bucket).createSignedUrl(r.path, r.ttl)))
      batch.forEach((r, j) => {
        const url = results[j].data?.signedUrl
        if (!url) return
        switch (r.target) {
          case 'cover': coverUrls[r.key] = url; break
          case 'audio': audioUrls[r.key] = url; break
          case 'avatar': avatarUrl = url; break
          case 'artistAvatar': artistAvatarUrl = url; break
          case 'memberAvatar': memberAvatarUrls[r.key] = url; break
        }
      })
    }

    set({
      ready: true,
      userId: user.id,
      email: user.email ?? null,
      artistId,
      profile,
      artist,
      albums: albumList,
      tracks: trackList,
      versions: allVersions,
      members: memberList,
      coverUrls,
      audioUrls,
      avatarUrl,
      artistAvatarUrl,
      memberAvatarUrls,
    })

    // Preload cover images and audio for recent tracks so content appears instantly
    if (typeof window !== 'undefined') {
      // Preload all cover images (albums + tracks)
      Object.values(coverUrls).forEach(url => {
        const img = new Image()
        img.src = url
      })
      // Preload artist avatar
      if (artistAvatarUrl) {
        const img = new Image()
        img.src = artistAvatarUrl
      }
      // Preload member avatars
      Object.values(memberAvatarUrls).forEach(url => {
        const img = new Image()
        img.src = url
      })
      // Preload user avatar
      if (avatarUrl) {
        const img = new Image()
        img.src = avatarUrl
      }
      // Preload audio for recent active versions so playback starts instantly
      const recentTracks = [...trackList].sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at)).slice(0, 8)
      for (const t of recentTracks) {
        const v = allVersions.find(ver => ver.track_id === t.id && ver.is_active)
        if (v && audioUrls[v.id]) {
          const a = new Audio()
          a.preload = 'auto'
          a.src = audioUrls[v.id]
        }
      }
    }
  },

  invalidate: () => set({ ready: false }),

  setProfile: (p) => set(s => ({ profile: s.profile ? { ...s.profile, ...p } : null })),
  setArtist: (a) => set(s => ({ artist: s.artist ? { ...s.artist, ...a } : null })),
  updateAlbum: (id, data) => set(s => ({ albums: s.albums.map(a => a.id === id ? { ...a, ...data } : a) })),
  addAlbum: (a) => set(s => ({ albums: [a, ...s.albums] })),
  updateTrack: (id, data) => set(s => ({ tracks: s.tracks.map(t => t.id === id ? { ...t, ...data } : t) })),
  addTrack: (t) => set(s => ({ tracks: [t, ...s.tracks] })),
  updateVersion: (id, data) => set(s => ({ versions: s.versions.map(v => v.id === id ? { ...v, ...data } : v) })),
  addVersion: (v) => set(s => ({ versions: [v, ...s.versions] })),
  setCoverUrl: (id, url) => set(s => ({ coverUrls: { ...s.coverUrls, [id]: url } })),
  setAudioUrl: (versionId, url) => set(s => ({ audioUrls: { ...s.audioUrls, [versionId]: url } })),
  setAvatarUrl: (url) => set({ avatarUrl: url }),
  setArtistAvatarUrl: (url) => set({ artistAvatarUrl: url }),
}))
