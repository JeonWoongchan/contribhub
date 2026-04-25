import { CardShell } from '@/components/shared/card/CardShell'
import { IssueItemFooter } from '@/components/shared/issue-card/IssueItemFooter'
import { IssueItemHeader } from '@/components/shared/issue-card/IssueItemHeader'
import type { IssueCardItem } from '@/types/issue'

type BookmarkCardProps = {
  issue: IssueCardItem
  isBookmarkPending: boolean
  onToggleBookmark: (issue: IssueCardItem) => Promise<void>
}

export function BookmarkCard({
  issue,
  isBookmarkPending,
  onToggleBookmark,
}: BookmarkCardProps) {
  return (
    <CardShell className="group transition-all" contentClassName="gap-4">
      <IssueItemHeader
        issue={issue}
        isBookmarkPending={isBookmarkPending}
        onToggleBookmark={onToggleBookmark}
      />
      <IssueItemFooter issue={issue} />
    </CardShell>
  )
}
