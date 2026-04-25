import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type CardShellProps = {
  children: ReactNode
  className?: string
  contentClassName?: string
}

export function CardShell({ children, className, contentClassName }: CardShellProps) {
  return (
    <Card size="sm" className={cn('h-full border border-border py-4', className)}>
      <CardContent className={cn('flex h-full flex-col gap-3', contentClassName)}>
        {children}
      </CardContent>
    </Card>
  )
}
