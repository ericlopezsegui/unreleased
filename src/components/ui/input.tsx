import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, type = 'text', ...props }, ref) => {
    return (
      <div className="relative group">
        {label && (
          <label className="block text-sm font-medium text-secondary mb-2 ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={type}
            className={cn(
              'w-full glass px-5 py-4 rounded-2xl',
              'text-foreground placeholder:text-secondary/40',
              'border-2 border-border/20',
              'focus:border-accent/50 focus:ring-4 focus:ring-accent/10',
              'transition-all duration-300',
              'hover:border-border/40',
              'hover:shadow-lg',
              className
            )}
            {...props}
          />
          <div
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-accent/20 to-accent-2/20 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none blur-xl -z-10"
          />
        </div>
      </div>
    )
  }
)

Input.displayName = 'Input'

export {}
