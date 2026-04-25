import { BookmarkCard } from './BookmarkCard'
import type { IssueCardItem } from '@/types/issue'

type BookmarkListContentProps = {
  issues: IssueCardItem[]
  pendingBookmarkKeys: string[]
  onToggleBookmark: (issue: IssueCardItem) => Promise<void>
}

export function BookmarkListContent({
  issues,
  pendingBookmarkKeys,
  onToggleBookmark,
}: BookmarkListContentProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {issues.map((issue) => (
        <BookmarkCard
          key={issue.url}
          issue={issue}
          isBookmarkPending={pendingBookmarkKeys.includes(`${issue.repoFullName}#${issue.number}`)}
          onToggleBookmark={onToggleBookmark}
        />
      ))}
    </div>
  )
}
