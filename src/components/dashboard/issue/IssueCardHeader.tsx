import { Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { IssueScoreBadge } from './IssueScoreBadge'
import type { IssueCardItem } from '@/types/issue'

type IssueCardHeaderProps = {
  issue: IssueCardItem
  isBookmarkPending: boolean
  onToggleBookmark: (issue: IssueCardItem) => Promise<void>
}

export function IssueCardHeader({
  issue,
  isBookmarkPending,
  onToggleBookmark,
}: IssueCardHeaderProps) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <span className="truncate text-xs text-muted-foreground">
          {issue.repoFullName}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            disabled={isBookmarkPending}
            aria-label={issue.isBookmarked ? '북마크 제거' : '북마크 추가'}
            aria-pressed={issue.isBookmarked ?? false}
            className={cn(
              'text-muted-foreground hover:bg-interactive-hover hover:text-interactive-action-hover',
              issue.isBookmarked ? 'text-interactive-action-hover' : null
            )}
            onClick={() => void onToggleBookmark(issue)}
          >
            <Bookmark className={cn('size-5 transition-colors', issue.isBookmarked ? 'fill-current' : null)} />
          </Button>
          {issue.score !== null ? <IssueScoreBadge score={issue.score} /> : null}
        </div>
      </div>

      <div className="flex items-start justify-between gap-3">
        <a
          href={issue.url}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 outline-none"
        >
          <h3 className="group flex items-center gap-1 line-clamp-2 text-sm font-medium leading-snug text-card-foreground transition-colors hover:text-interactive-action-hover">
            {issue.title}
          </h3>
        </a>
      </div>
    </>
  )
}
