import { Badge } from '@/components/ui/badge'
import { getHealthTier } from '@/lib/github/health-tier'
import { cn } from '@/lib/utils'

type RepoHealthBadgeProps = {
  score: number | null
  className?: string
}

const HEALTH_TIER_STYLES = {
  success: 'border-status-success-border bg-status-success text-status-success-foreground',
  warning: 'border-status-warning-border bg-status-warning text-status-warning-foreground',
  danger: 'border-status-danger-border bg-status-danger text-status-danger-foreground',
} as const

export function RepoHealthBadge({ score, className }: RepoHealthBadgeProps) {
  if (score === null) return null

  const tier = getHealthTier(score)

  return (
    <Badge
      variant="outline"
      className={cn('gap-1 rounded-md px-1.5 py-0.5', HEALTH_TIER_STYLES[tier.variant], className)}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span
          className={cn(
            'absolute inline-flex h-full w-full rounded-full bg-current',
            tier.isAnimated && 'animate-ping opacity-75'
          )}
        />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
      </span>
      {tier.label}
    </Badge>
  )
}
