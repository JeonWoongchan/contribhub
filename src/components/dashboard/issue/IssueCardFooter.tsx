import { ExternalLink } from 'lucide-react'
import { IssueMetrics } from '@/components/dashboard/issue/IssueMetrics'
import { RepoHealthBadge } from '@/components/dashboard/issue/RepoHealthBadge'
import { Badge } from '@/components/ui/badge'
import { formatTimeAgo } from '@/lib/format/time-ago'
import { getCompetitionMeta } from '@/lib/github/issue-badge-meta'
import { cn } from '@/lib/utils'
import {IssueCardTags} from "@/components/dashboard/issue/IssueCardTags";
import {IssueCardProps} from "@/types/issue";

export function IssueCardFooter({issue}: IssueCardProps) {
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
        <ExternalLink className="ml-auto h-3 w-3 text-interactive-action opacity-0 transition-opacity group-hover:opacity-70" />
      </div>
    </div>
  )
}
