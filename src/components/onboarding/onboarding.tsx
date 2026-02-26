'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const onboardingSteps = [
  {
    title: 'Welcome to Unreleased',
    description: 'Your private space to manage and share your music',
    visual: '🎵',
  },
  {
    title: 'Create Artists & Albums',
    description: 'Organize your work with artist profiles and private albums',
    visual: '🎨',
  },
  {
    title: 'Upload Tracks & Versions',
    description: 'Upload multiple versions of each track and choose your favorite',
    visual: '📀',
  },
  {
    title: 'Manage Stems',
    description: 'Upload and organize stems for each version (vocals, drums, bass...)',
    visual: '🎚️',
  },
  {
    title: 'Try Cover Art',
    description: 'Upload and preview different covers before deciding',
    visual: '🖼️',
  },
  {
    title: 'Share Privately',
    description: 'Generate private links to share specific tracks or albums',
    visual: '🔗',
  },
]

interface OnboardingProps {
  onComplete: () => void
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleComplete = async () => {
    setIsCompleting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('profiles')
          .upsert({
            user_id: user.id,
            onboarding_completed: true,
          })
      }
      onComplete()
    } catch (error) {
      console.error('Error completing onboarding:', error)
    } finally {
      setIsCompleting(false)
    }
  }

  const isLastStep = currentStep === onboardingSteps.length - 1

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress indicators */}
        <div className="flex justify-center gap-2 mb-12">
          {onboardingSteps.map((_, index) => (
            <div
              key={index}
              className={`h-1 w-12 rounded-full transition-all ${
                index === currentStep
                  ? 'bg-foreground'
                  : index < currentStep
                  ? 'bg-foreground/40'
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="text-center space-y-8">
          <div className="text-7xl mb-8 animate-in fade-in duration-500">
            {onboardingSteps[currentStep].visual}
          </div>
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-light tracking-tight">
              {onboardingSteps[currentStep].title}
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              {onboardingSteps[currentStep].description}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-16">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="p-3 hover:bg-muted rounded-full transition-colors disabled:opacity-0 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {isLastStep ? (
            <button
              onClick={handleComplete}
              disabled={isCompleting}
              className="px-8 py-3 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isCompleting ? 'Loading...' : 'Get Started'}
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="p-3 hover:bg-muted rounded-full transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Skip button */}
        <div className="text-center mt-8">
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip tutorial
          </button>
        </div>
      </div>
    </div>
  )
}
