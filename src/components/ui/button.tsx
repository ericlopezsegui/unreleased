export {}
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'relative inline-flex items-center justify-center font-medium transition-all duration-300',
          'disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed',
          'overflow-hidden group',
          {
            'bg-gradient-to-r from-accent via-accent to-accent-2 text-white shadow-lg shadow-accent/30 hover:shadow-2xl hover:shadow-accent/50 hover:scale-[1.02] active:scale-[0.98] glow':
              variant === 'primary',
            'glass text-foreground hover:shadow-lg border border-border/50 hover:border-border':
              variant === 'secondary',
            'hover:bg-muted/30 text-foreground hover:shadow-md': variant === 'ghost',
            'px-4 py-2.5 text-sm rounded-xl font-medium': size === 'sm',
            'px-6 py-3.5 text-base rounded-2xl font-semibold': size === 'md',
            'px-8 py-4.5 text-lg rounded-2xl font-bold': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {variant === 'primary' && (
          <>
            <span className="absolute inset-0 shimmer" />
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </>
        )}
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </button>
    )
  }
)

Button.displayName = 'Button'
