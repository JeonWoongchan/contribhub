import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type CenteredPanelProps = {
  children: ReactNode
  className?: string
  contentClassName?: string
}

export function CenteredPanel({ children, className, contentClassName }: CenteredPanelProps) {
  return (
    <div className={cn('flex min-h-screen items-center justify-center bg-muted px-4', className)}>
      <div
        className={cn(
          'w-full max-w-lg rounded-2xl border border-border bg-card p-8 shadow-sm',
          contentClassName
        )}
      >
        {children}
      </div>
    </div>
  )
}
