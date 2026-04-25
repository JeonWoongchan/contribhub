// PR 카드 헤더 — 레포지토리, 상태 배지, 제목 표시

import { GitPullRequest } from 'lucide-react'
import { CardHeaderLayout } from '@/components/shared/card/CardHeaderLayout'
import { CardTitleLink } from '@/components/shared/card/CardTitleLink'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { PullRequestItem } from '@/types/pull-request'

type PRCardHeaderProps = {
  pr: PullRequestItem
}

// PR 상태별 표시 라벨 및 색상 정의
const STATE_META: Record<string, { label: string; className: string }> = {
  OPEN: { label: '진행 중', className: 'border-green-500/30 bg-green-500/10 text-green-700' },
  MERGED: { label: '병합됨', className: 'border-purple-500/30 bg-purple-500/10 text-purple-700' },
  CLOSED: { label: '닫힘', className: 'border-red-500/30 bg-red-500/10 text-red-700' },
}

export function PRCardHeader({ pr }: PRCardHeaderProps) {
  const stateMeta = STATE_META[pr.state]

  return (
    <CardHeaderLayout
      topLeft={
        <a
          href={pr.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="truncate text-xs text-muted-foreground transition-colors hover:text-interactive-action-hover"
        >
          {pr.repoFullName}
        </a>
      }
      topRight={
        stateMeta ? (
          <Badge variant="outline" className={cn('rounded-md', stateMeta.className)}>
            {stateMeta.label}
          </Badge>
        ) : null
      }
      title={
        <CardTitleLink href={pr.url} icon={<GitPullRequest className="size-4 shrink-0" />}>
          {pr.title}
        </CardTitleLink>
      }
    />
  )
}
