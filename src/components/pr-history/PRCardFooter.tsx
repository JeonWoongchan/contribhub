// PR 카드 푸터 — 태그와 메트릭스 표시

import { FileCode, MessageSquare, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatTimeAgo } from '@/lib/format/time-ago'
import type { PullRequestItem } from '@/types/pull-request'

type PRCardFooterProps = {
  pr: PullRequestItem
}

export function PRCardFooter({ pr }: PRCardFooterProps) {
  return (
    <div className="mt-auto flex flex-col gap-3">
      {/* 태그: 언어 + 라벨 */}
      <div className="flex flex-wrap gap-1.5">
        {pr.language && (
          <Badge variant="secondary" className="rounded-md text-xs">
            {pr.language}
          </Badge>
        )}
        {pr.labels.slice(0, 3).map((label) => (
          <Badge key={label} variant="outline" className="rounded-md text-xs">
            {label}
          </Badge>
        ))}
      </div>

      {/* 메트릭스: 코드 변경, 댓글, 스타, 날짜 */}
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <FileCode className="size-3.5" />
          <span className="text-green-600">+{pr.additions}</span>
          <span className="text-red-600">-{pr.deletions}</span>
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="size-3.5" />
          {pr.commentCount}
        </span>
        <span className="flex items-center gap-1">
          <Star className="size-3.5" />
          {pr.stargazerCount.toLocaleString()}
        </span>
        <span className="ml-auto text-interactive-action-hover">{formatTimeAgo(pr.createdAt)}</span>
      </div>
    </div>
  )
}
