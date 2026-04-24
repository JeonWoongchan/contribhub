import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { IssueCardFooter } from './IssueCardFooter'
import { IssueCardHeader } from './IssueCardHeader'
import type { ScoredIssue } from '@/types/issue'

type IssueCardProps = {
  issue: ScoredIssue
  isBookmarkPending: boolean
  onToggleBookmark: (issue: ScoredIssue) => Promise<void>
}

export function IssueCard({
  issue,
  isBookmarkPending,
  onToggleBookmark,
}: IssueCardProps) {
  return (
    <Card
      size="sm"
      className={cn(
        'group h-full border border-border py-4 transition-all',
      )}
    >
      <CardContent className="flex h-full flex-col gap-4">
        <IssueCardHeader
          issue={issue}
          isBookmarkPending={isBookmarkPending}
          onToggleBookmark={onToggleBookmark}
        />
        <IssueCardFooter issue={issue} />
      </CardContent>
    </Card>
  )
}
