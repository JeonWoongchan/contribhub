import { CardShell } from '@/components/shared/card/CardShell'
import { IssueItemFooter } from '@/components/shared/issue-card/IssueItemFooter'
import { IssueItemHeader } from '@/components/shared/issue-card/IssueItemHeader'
import type { IssueCardItem } from '@/types/issue'

type IssueCardProps = {
  issue: IssueCardItem
  onToggleBookmark: (issue: IssueCardItem) => Promise<void>
}

export function IssueCard({
  issue,
  onToggleBookmark,
}: IssueCardProps) {
  return (
    <CardShell className="group transition-all" contentClassName="gap-4">
      <IssueItemHeader
        issue={issue}
        onToggleBookmark={onToggleBookmark}
      />
      <IssueItemFooter issue={issue} />
    </CardShell>
  )
}
