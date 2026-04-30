import { Badge } from '@/components/ui/badge'
import { getHealthTier } from '@/lib/github/repo-health/tier'
import { cn } from '@/lib/utils'

type RepoHealthBadgeProps = {
  score: number | null
  className?: string
}

export function RepoHealthBadge({ score, className }: RepoHealthBadgeProps) {
  if (score === null) return null

  const tier = getHealthTier(score)
  const variantClassName =
    tier.variant === 'success'
      ? 'border-status-success-border bg-status-success text-status-success-foreground'
      : tier.variant === 'warning'
        ? 'border-status-warning-border bg-status-warning text-status-warning-foreground'
        : 'border-status-danger-border bg-status-danger text-status-danger-foreground'

  return (
    <Badge variant="outline" className={cn('rounded-md', variantClassName, className)}>
      {tier.label}
    </Badge>
  )
}
