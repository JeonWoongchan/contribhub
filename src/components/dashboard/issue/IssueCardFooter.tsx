import { Badge } from '@/components/ui/badge'
import { formatTimeAgo } from '@/lib/format/time-ago'
import { getCompetitionMeta } from '@/lib/github/issue-badge-meta'
import { cn } from '@/lib/utils'
import { IssueCardTags } from './IssueCardTags'
import { IssueMetrics } from './IssueMetrics'
import { RepoHealthBadge } from './RepoHealthBadge'
import type { ScoredIssue } from '@/types/issue'

type IssueCardFooterProps = {
  issue: ScoredIssue
}

export function IssueCardFooter({ issue }: IssueCardFooterProps) {
  const competition = getCompetitionMeta(issue.competitionLevel)

  return (
    <div className="mt-auto flex flex-col gap-3 text-xs text-muted-foreground">
      <IssueCardTags
        difficultyLevel={issue.difficultyLevel}
        labels={issue.labels}
        language={issue.language}
      />

      <IssueMetrics commentCount={issue.commentCount} stargazerCount={issue.stargazerCount} />

      <div className="flex flex-wrap items-center gap-2">
        <RepoHealthBadge score={issue.healthScore} />
        <Badge variant="outline" className={cn('rounded-md', competition.className)}>
          {competition.label}
        </Badge>
        <span className="text-interactive-action-hover">{formatTimeAgo(issue.updatedAt)}</span>
      </div>
    </div>
  )
}
