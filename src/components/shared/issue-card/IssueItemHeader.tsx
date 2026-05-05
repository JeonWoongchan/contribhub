import { CardHeaderLayout } from '@/components/shared/card/CardHeaderLayout'
import { CardTitleLink } from '@/components/shared/card/CardTitleLink'
import { BookmarkButton } from './BookmarkButton'
import { IssueScoreBadge } from './IssueScoreBadge'
import type { IssueCardItem } from '@/types/issue'

type IssueItemHeaderProps = {
  issue: IssueCardItem
  isBookmarkPending: boolean
  onToggleBookmark: (issue: IssueCardItem) => Promise<void>
}

export function IssueItemHeader({
  issue,
  isBookmarkPending,
  onToggleBookmark,
}: IssueItemHeaderProps) {
  return (
    <CardHeaderLayout
      topLeft={
        <a
          href={issue.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate text-xs text-muted-foreground transition-colors hover:text-interactive-action-hover"
        >
          {issue.repoFullName}
        </a>
      }
      topRight={
        <div className="flex items-center gap-1">
          <BookmarkButton
            issue={issue}
            isBookmarkPending={isBookmarkPending}
            onToggleBookmarkAction={onToggleBookmark}
          />
          {issue.score !== null ? <IssueScoreBadge score={issue.score} /> : null}
        </div>
      }
      title={<CardTitleLink href={issue.url}>{issue.title}</CardTitleLink>}
    />
  )
}
