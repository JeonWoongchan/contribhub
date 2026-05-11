import { IssueCard } from '@/components/dashboard/issue/IssueCard'
import type { IssueCardItem } from '@/types/issue'

type BookmarkListContentProps = {
  issues: IssueCardItem[]
  onToggleBookmark: (issue: IssueCardItem) => Promise<void>
}

export function BookmarkListContent({
  issues,
  onToggleBookmark,
}: BookmarkListContentProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {issues.map((issue) => (
        <IssueCard
          key={issue.url}
          issue={issue}
          onToggleBookmark={onToggleBookmark}
        />
      ))}
    </div>
  )
}
