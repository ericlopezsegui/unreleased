'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useTheme } from '@/components/providers/theme-provider'
import { 
  Home, 
  User, 
  Album, 
  Music, 
  Share2, 
  LogOut,
  Moon,
  Sun,
  Monitor
} from 'lucide-react'

export default function MainLayout() {
  const [currentView, setCurrentView] = useState<'home' | 'artists' | 'albums' | 'tracks' | 'shares'>('home')
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const cycleTheme = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
    setTheme(next)
  }

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun className="w-5 h-5" />
      case 'dark': return <Moon className="w-5 h-5" />
      case 'system': return <Monitor className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/40 p-6 flex flex-col">
        {/* Logo */}
        <div className="mb-12">
          <h1 className="text-2xl font-light tracking-tight">Unreleased</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          <NavButton
            icon={<Home className="w-5 h-5" />}
            label="Home"
            active={currentView === 'home'}
            onClick={() => setCurrentView('home')}
          />
          <NavButton
            icon={<User className="w-5 h-5" />}
            label="Artists"
            active={currentView === 'artists'}
            onClick={() => setCurrentView('artists')}
          />
          <NavButton
            icon={<Album className="w-5 h-5" />}
            label="Albums"
            active={currentView === 'albums'}
            onClick={() => setCurrentView('albums')}
          />
          <NavButton
            icon={<Music className="w-5 h-5" />}
            label="Tracks"
            active={currentView === 'tracks'}
            onClick={() => setCurrentView('tracks')}
          />
          <NavButton
            icon={<Share2 className="w-5 h-5" />}
            label="Shared"
            active={currentView === 'shares'}
            onClick={() => setCurrentView('shares')}
          />
        </nav>

        {/* Bottom actions */}
        <div className="space-y-1 pt-6 border-t border-border/40">
          <button
            onClick={cycleTheme}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
          >
            {getThemeIcon()}
            <span className="capitalize">{theme}</span>
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          {currentView === 'home' && <HomeView />}
          {currentView === 'artists' && <ArtistsView />}
          {currentView === 'albums' && <AlbumsView />}
          {currentView === 'tracks' && <TracksView />}
          {currentView === 'shares' && <SharesView />}
        </div>
      </main>
    </div>
  )
}

interface NavButtonProps {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}

function NavButton({ icon, label, active, onClick }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-lg transition-colors ${
        active
          ? 'bg-foreground text-background'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

// Placeholder views
function HomeView() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-light tracking-tight mb-2">Welcome back</h2>
        <p className="text-muted-foreground">Here's what's happening with your music</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Artists" value="0" />
        <StatCard title="Albums" value="0" />
        <StatCard title="Tracks" value="0" />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
        <div className="bg-muted/30 rounded-lg p-12 text-center text-muted-foreground">
          No recent activity
        </div>
      </div>
    </div>
  )
}

function ArtistsView() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-light tracking-tight">Artists</h2>
        <button className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          New Artist
        </button>
      </div>
      <div className="bg-muted/30 rounded-lg p-12 text-center text-muted-foreground">
        No artists yet. Create your first artist profile.
      </div>
    </div>
  )
}

function AlbumsView() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-light tracking-tight">Albums</h2>
        <button className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          New Album
        </button>
      </div>
      <div className="bg-muted/30 rounded-lg p-12 text-center text-muted-foreground">
        No albums yet. Create your first album.
      </div>
    </div>
  )
}

function TracksView() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-light tracking-tight">Tracks</h2>
        <button className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          Upload Track
        </button>
      </div>
      <div className="bg-muted/30 rounded-lg p-12 text-center text-muted-foreground">
        No tracks yet. Upload your first track.
      </div>
    </div>
  )
}

function SharesView() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-light tracking-tight">Shared Links</h2>
        <button className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          Create Link
        </button>
      </div>
      <div className="bg-muted/30 rounded-lg p-12 text-center text-muted-foreground">
        No shared links yet. Create a private link to share your music.
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
}

function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="bg-muted/30 rounded-lg p-6">
      <div className="text-sm text-muted-foreground mb-1">{title}</div>
      <div className="text-3xl font-light">{value}</div>
    </div>
  )
}
