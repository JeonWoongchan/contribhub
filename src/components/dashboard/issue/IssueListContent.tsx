import { IssueCard } from './IssueCard'
import { IssueListPartialNotice } from './IssueListPartialNotice'
import type { IssueCardItem } from '@/types/issue'

type IssueListContentProps = {
  issues: IssueCardItem[]
  partial: boolean
  failedCount: number
  pendingBookmarkKeys: string[]
  onToggleBookmark: (issue: IssueCardItem) => Promise<void>
}

export function IssueListContent({
  issues,
  partial,
  failedCount,
  pendingBookmarkKeys,
  onToggleBookmark,
}: IssueListContentProps) {
  return (
    <div className="flex flex-col gap-4">
      {partial ? <IssueListPartialNotice failedCount={failedCount} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {issues.map((issue) => (
          <IssueCard
            key={issue.url}
            issue={issue}
            isBookmarkPending={pendingBookmarkKeys.includes(`${issue.repoFullName}#${issue.number}`)}
            onToggleBookmark={onToggleBookmark}
          />
        ))}
      </div>
    </div>
  )
}
