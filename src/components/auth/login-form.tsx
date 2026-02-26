'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${location.origin}/auth/callback`,
          },
        })
        if (error) throw error
      }
      
      router.refresh()
      router.push('/home')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Logo/Title */}
      <div className="text-center">
        <h1 className="text-4xl font-light tracking-tight">Unreleased</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === 'signin' ? 'Welcome back' : 'Create your account'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-4">
          <div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-muted/50 border-0 rounded-lg focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all"
              placeholder="Email address"
            />
          </div>
          <div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-muted/50 border-0 rounded-lg focus:outline-none focus:ring-1 focus:ring-foreground/20 transition-all"
              placeholder="Password"
            />
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-500 text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : mode === 'signin' ? 'Sign in' : 'Sign up'}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin')
            setError(null)
          }}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {mode === 'signin' 
            ? "Don't have an account? Sign up" 
            : 'Already have an account? Sign in'}
        </button>
      </form>
    </div>
  )
}
