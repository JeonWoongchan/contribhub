import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type CardMetricsRowProps = {
  children: ReactNode
  className?: string
}

export function CardMetricsRow({ children, className }: CardMetricsRowProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3 text-xs text-muted-foreground', className)}>
      {children}
    </div>
  )
}
