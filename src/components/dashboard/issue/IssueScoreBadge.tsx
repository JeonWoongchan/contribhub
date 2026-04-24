import { Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type IssueScoreBadgeProps = {
  score: number
  className?: string
}

export function IssueScoreBadge({ score, className }: IssueScoreBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'shrink-0 rounded-md border-transparent bg-interactive-action text-interactive-action-foreground',
        className
      )}
    >
      <Zap className="h-3 w-3" />
      <span className="tabular-nums">{score}</span>
    </Badge>
  )
}
