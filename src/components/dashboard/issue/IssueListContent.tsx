import { IssueCard } from './IssueCard'
import { IssueListPartialNotice } from './IssueListPartialNotice'
import type { ScoredIssue } from '@/types/issue'

type IssueListContentProps = {
  issues: ScoredIssue[]
  partial: boolean
  failedCount: number
}

export function IssueListContent({
  issues,
  partial,
  failedCount,
}: IssueListContentProps) {
  return (
    <div className="flex flex-col gap-4">
      {partial ? <IssueListPartialNotice failedCount={failedCount} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {issues.map((issue) => (
          <IssueCard key={issue.url} issue={issue} />
        ))}
      </div>
    </div>
  )
}
