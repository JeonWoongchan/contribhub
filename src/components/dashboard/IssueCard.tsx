import { ExternalLink, GitPullRequest, MessageCircle, Star, Zap } from 'lucide-react'
import { RepoHealthBadge } from '@/components/dashboard/RepoHealthBadge'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ScoredIssue } from '@/types/issue'

const COMPETITION_CONFIG = {
  OPEN: {
    label: '오픈',
    className: 'border-status-success-border bg-status-success text-status-success-foreground',
  },
  COMPETITIVE: {
    label: '경쟁 중',
    className: 'border-status-warning-border bg-status-warning text-status-warning-foreground',
  },
  TAKEN: {
    label: 'PR 있음',
    className: 'border-status-danger-border bg-status-danger text-status-danger-foreground',
  },
} as const

const DIFFICULTY_KO: Record<string, string> = {
  beginner: '입문',
  junior: '주니어',
  mid: '미드',
  senior: '시니어',
}

function timeAgo(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)

  if (days === 0) return '오늘'
  if (days < 7) return `${days}일 전`
  if (days < 30) return `${Math.floor(days / 7)}주 전`
  if (days < 365) return `${Math.floor(days / 30)}개월 전`

  return `${Math.floor(days / 365)}년 전`
}

type IssueCardProps = {
  issue: ScoredIssue
}

export function IssueCard({ issue }: IssueCardProps) {
  const competition = COMPETITION_CONFIG[issue.competitionLevel]

  return (
    <a
      href={issue.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'group block outline-none transition-transform duration-150 hover:-translate-y-0.5',
        'focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-interactive-selected-ring/60'
      )}
    >
      <Card
        size="sm"
        className={cn(
          'h-full border border-border py-4 transition-all',
          'group-hover:border-interactive-selected-border group-hover:shadow-[0_0_0_1px_var(--color-interactive-selected-border)]'
        )}
      >
        <CardContent className="flex h-full flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <span className="truncate text-xs text-muted-foreground">{issue.repoFullName}</span>
            <Badge
              variant="outline"
              className="shrink-0 rounded-md border-transparent bg-interactive-action text-interactive-action-foreground"
            >
              <Zap className="h-3 w-3" />
              <span className="tabular-nums">{issue.score}</span>
            </Badge>
          </div>

          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-card-foreground transition-colors group-hover:text-interactive-action-hover">
            {issue.title}
          </h3>

          <div className="flex flex-wrap gap-1.5">
            {issue.language && (
              <Badge
                variant="outline"
                className="rounded-md border-interactive-selected-border bg-interactive-selected text-interactive-selected-foreground"
              >
                {issue.language}
              </Badge>
            )}
            {issue.difficultyLevel && (
              <Badge variant="secondary" className="rounded-md">
                {DIFFICULTY_KO[issue.difficultyLevel] ?? issue.difficultyLevel}
              </Badge>
            )}
            {issue.labels.slice(0, 2).map((label) => (
              <Badge key={label} variant="outline" className="rounded-md text-muted-foreground">
                {label}
              </Badge>
            ))}
          </div>

          <div className="mt-auto flex flex-col gap-3 text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                {issue.stargazerCount.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {issue.commentCount}
              </span>
              {issue.hasPR && (
                <Badge
                  variant="outline"
                  className="rounded-md border-status-warning-border bg-status-warning text-status-warning-foreground"
                >
                  <GitPullRequest className="h-3 w-3" />
                  PR 있음
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <RepoHealthBadge score={issue.healthScore} />
              <Badge variant="outline" className={cn('rounded-md', competition.className)}>
                {competition.label}
              </Badge>
              <span className="text-interactive-action-hover">{timeAgo(issue.updatedAt)}</span>
              <ExternalLink className="ml-auto h-3 w-3 text-interactive-action opacity-0 transition-opacity group-hover:opacity-70" />
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  )
}
