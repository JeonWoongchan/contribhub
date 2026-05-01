// PR 카드 헤더 — 레포지토리, 상태 배지, 제목 표시

import { GitPullRequest } from 'lucide-react'
import { CardHeaderLayout } from '@/components/shared/card/CardHeaderLayout'
import { CardTitleLink } from '@/components/shared/card/CardTitleLink'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { PR_STATE_META } from '@/lib/github/issues/badge-meta'
import type { PullRequestItem } from '@/types/pull-request'

type PRCardHeaderProps = {
  pr: PullRequestItem
}

export function PRCardHeader({ pr }: PRCardHeaderProps) {
  const stateMeta = PR_STATE_META[pr.state]

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
