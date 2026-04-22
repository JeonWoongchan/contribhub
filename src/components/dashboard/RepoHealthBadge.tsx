import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type RepoHealthBadgeProps = {
  score: number | null
  className?: string
}

type HealthTier = {
  label: string
  className: string
}

function getHealthTier(score: number): HealthTier {
  if (score >= 80) {
    return {
      label: '활성',
      className: 'border-status-success-border bg-status-success text-status-success-foreground',
    }
  }

  if (score >= 60) {
    return {
      label: '보통',
      className: 'border-status-warning-border bg-status-warning text-status-warning-foreground',
    }
  }

  if (score >= 40) {
    return {
      label: '저조',
      className: 'border-status-warning-border bg-status-warning text-status-warning-foreground',
    }
  }

  return {
    label: '비활성',
    className: 'border-status-danger-border bg-status-danger text-status-danger-foreground',
  }
}

export function RepoHealthBadge({ score, className }: RepoHealthBadgeProps) {
  if (score === null) return null

  const tier = getHealthTier(score)

  return (
    <Badge
      variant="outline"
      className={cn('gap-1 rounded-md px-1.5 py-0.5', tier.className, className)}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span
          className={cn(
            'absolute inline-flex h-full w-full rounded-full bg-current',
            score >= 80 && 'animate-ping opacity-75'
          )}
        />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
      </span>
      {tier.label}
    </Badge>
  )
}
