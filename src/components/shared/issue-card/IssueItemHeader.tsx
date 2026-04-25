import { Bookmark } from 'lucide-react'
import { CardHeaderLayout } from '@/components/shared/card/CardHeaderLayout'
import { CardTitleLink } from '@/components/shared/card/CardTitleLink'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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
      topLeft={<span className="truncate text-xs text-muted-foreground">{issue.repoFullName}</span>}
      topRight={
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            disabled={isBookmarkPending}
            aria-label={issue.isBookmarked ? '북마크 제거' : '북마크 추가'}
            aria-pressed={issue.isBookmarked ?? false}
            className={cn(
              'text-muted-foreground hover:bg-interactive-hover hover:text-bookmark-action-hover',
              issue.isBookmarked ? 'text-bookmark-action' : null
            )}
            onClick={() => void onToggleBookmark(issue)}
          >
            <Bookmark className={cn('size-5 transition-colors', issue.isBookmarked ? 'fill-current' : null)} />
          </Button>
          {issue.score !== null ? <IssueScoreBadge score={issue.score} /> : null}
        </div>
      }
      title={<CardTitleLink href={issue.url}>{issue.title}</CardTitleLink>}
    />
  )
}
