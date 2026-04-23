import { IssueScoreBadge } from './IssueScoreBadge'
import type { ScoredIssue } from '@/types/issue'

type IssueCardHeaderProps = {
  issue: ScoredIssue
}

export function IssueCardHeader({ issue }: IssueCardHeaderProps) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="truncate text-xs text-muted-foreground">{issue.repoFullName}</span>
        <IssueScoreBadge score={issue.score} />
      </div>

      <h3 className="line-clamp-2 text-sm font-medium leading-snug text-card-foreground transition-colors group-hover:text-interactive-action-hover">
        {issue.title}
      </h3>
    </>
  )
}
