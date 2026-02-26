export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          user_id: string
          display_name: string | null
          avatar_path: string | null
          theme: 'light' | 'dark' | 'system'
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          display_name?: string | null
          avatar_path?: string | null
          theme?: 'light' | 'dark' | 'system'
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          display_name?: string | null
          avatar_path?: string | null
          theme?: 'light' | 'dark' | 'system'
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      artists: {
        Row: {
          id: string
          owner_user_id: string
          handle: string | null
          name: string
          bio: string | null
          avatar_path: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_user_id: string
          handle?: string | null
          name: string
          bio?: string | null
          avatar_path?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_user_id?: string
          handle?: string | null
          name?: string
          bio?: string | null
          avatar_path?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      artist_members: {
        Row: {
          artist_id: string
          user_id: string
          role: 'owner' | 'editor' | 'viewer'
          created_at: string
        }
        Insert: {
          artist_id: string
          user_id: string
          role?: 'owner' | 'editor' | 'viewer'
          created_at?: string
        }
        Update: {
          artist_id?: string
          user_id?: string
          role?: 'owner' | 'editor' | 'viewer'
          created_at?: string
        }
      }
      albums: {
        Row: {
          id: string
          artist_id: string
          title: string
          description: string | null
          cover_path: string | null
          is_archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          artist_id: string
          title: string
          description?: string | null
          cover_path?: string | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          artist_id?: string
          title?: string
          description?: string | null
          cover_path?: string | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tracks: {
        Row: {
          id: string
          artist_id: string
          album_id: string | null
          title: string
          description: string | null
          position: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          artist_id: string
          album_id?: string | null
          title: string
          description?: string | null
          position?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          artist_id?: string
          album_id?: string | null
          title?: string
          description?: string | null
          position?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      track_versions: {
        Row: {
          id: string
          track_id: string
          label: string
          notes: string | null
          audio_path: string | null
          duration_seconds: number | null
          bpm: number | null
          key: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          track_id: string
          label: string
          notes?: string | null
          audio_path?: string | null
          duration_seconds?: number | null
          bpm?: number | null
          key?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          track_id?: string
          label?: string
          notes?: string | null
          audio_path?: string | null
          duration_seconds?: number | null
          bpm?: number | null
          key?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      stems: {
        Row: {
          id: string
          version_id: string
          stem_type: 'vocals' | 'drums' | 'bass' | 'instrumental' | 'fx' | 'other'
          label: string | null
          audio_path: string
          created_at: string
        }
        Insert: {
          id?: string
          version_id: string
          stem_type: 'vocals' | 'drums' | 'bass' | 'instrumental' | 'fx' | 'other'
          label?: string | null
          audio_path: string
          created_at?: string
        }
        Update: {
          id?: string
          version_id?: string
          stem_type?: 'vocals' | 'drums' | 'bass' | 'instrumental' | 'fx' | 'other'
          label?: string | null
          audio_path?: string
          created_at?: string
        }
      }
      cover_assets: {
        Row: {
          id: string
          artist_id: string
          album_id: string | null
          version_id: string | null
          image_path: string
          created_at: string
        }
        Insert: {
          id?: string
          artist_id: string
          album_id?: string | null
          version_id?: string | null
          image_path: string
          created_at?: string
        }
        Update: {
          id?: string
          artist_id?: string
          album_id?: string | null
          version_id?: string | null
          image_path?: string
          created_at?: string
        }
      }
      share_links: {
        Row: {
          id: string
          created_by: string
          scope: 'album' | 'track' | 'version'
          album_id: string | null
          track_id: string | null
          version_id: string | null
          token_hash: string
          can_download: boolean
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          created_by: string
          scope: 'album' | 'track' | 'version'
          album_id?: string | null
          track_id?: string | null
          version_id?: string | null
          token_hash: string
          can_download?: boolean
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          created_by?: string
          scope?: 'album' | 'track' | 'version'
          album_id?: string | null
          track_id?: string | null
          version_id?: string | null
          token_hash?: string
          can_download?: boolean
          expires_at?: string | null
          created_at?: string
        }
      }
      download_events: {
        Row: {
          id: string
          share_link_id: string | null
          version_id: string | null
          ip_hash: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          share_link_id?: string | null
          version_id?: string | null
          ip_hash?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          share_link_id?: string | null
          version_id?: string | null
          ip_hash?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
  }
}
