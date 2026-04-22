import { ExternalLink, GitPullRequest, MessageCircle, Star } from 'lucide-react'
import { RepoHealthBadge } from '@/components/dashboard/RepoHealthBadge'
import { Badge } from '@/components/ui/badge'
import { formatTimeAgo } from '@/lib/format/time-ago'
import { getCompetitionMeta } from '@/lib/github/issue-badge-meta'
import { cn } from '@/lib/utils'
import type { ScoredIssue } from '@/types/issue'

type IssueCardFooterProps = {
  commentCount: ScoredIssue['commentCount']
  competitionLevel: ScoredIssue['competitionLevel']
  hasPR: ScoredIssue['hasPR']
  healthScore: ScoredIssue['healthScore']
  stargazerCount: ScoredIssue['stargazerCount']
  updatedAt: ScoredIssue['updatedAt']
}

export function IssueCardFooter({
  commentCount,
  competitionLevel,
  hasPR,
  healthScore,
  stargazerCount,
  updatedAt,
}: IssueCardFooterProps) {
  const competition = getCompetitionMeta(competitionLevel)

  return (
    <div className="mt-auto flex flex-col gap-3 text-xs text-muted-foreground">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1">
          <Star className="h-3 w-3" />
          {stargazerCount.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle className="h-3 w-3" />
          {commentCount}
        </span>
        {hasPR && (
          <Badge
            variant="outline"
            className="rounded-md border-status-warning-border bg-status-warning text-status-warning-foreground"
          >
            <GitPullRequest className="h-3 w-3" />
            PR 있음
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <RepoHealthBadge score={healthScore} />
        <Badge variant="outline" className={cn('rounded-md', competition.className)}>
          {competition.label}
        </Badge>
        <span className="text-interactive-action-hover">{formatTimeAgo(updatedAt)}</span>
        <ExternalLink className="ml-auto h-3 w-3 text-interactive-action opacity-0 transition-opacity group-hover:opacity-70" />
      </div>
    </div>
  )
}
