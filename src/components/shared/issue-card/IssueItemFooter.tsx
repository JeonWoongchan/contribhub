import { Badge } from '@/components/ui/badge'
import { CardMetricsRow } from '@/components/shared/card/CardMetricsRow'
import { formatTimeAgo } from '@/utils/format/time-ago'
import { getCompetitionMeta } from '@/lib/github/issues/badge-meta'
import { cn } from '@/lib/utils'
import { IssueMetricsRow } from './IssueMetricsRow'
import { IssueTagList } from './IssueTagList'
import type { IssueCardItem } from '@/types/issue'

type IssueItemFooterProps = {
  issue: IssueCardItem
}

export function IssueItemFooter({ issue }: IssueItemFooterProps) {
  const competition = issue.competitionLevel ? getCompetitionMeta(issue.competitionLevel) : null

  return (
    <div className="mt-auto flex flex-col gap-3 text-xs text-muted-foreground">
      <IssueTagList
        difficultyLevel={issue.difficultyLevel}
        labels={issue.labels}
        language={issue.language}
      />

      <CardMetricsRow>
        <IssueMetricsRow commentCount={issue.commentCount} stargazerCount={issue.stargazerCount} />
      </CardMetricsRow>

      <CardMetricsRow className="gap-2">
        {competition ? (
          <Badge variant="outline" className={cn('rounded-md', competition.className)}>
            {competition.label}
          </Badge>
        ) : null}
        <span className="text-interactive-action-hover">{formatTimeAgo(issue.updatedAt)}</span>
      </CardMetricsRow>
    </div>
  )
}
