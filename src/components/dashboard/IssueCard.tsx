import { Zap } from 'lucide-react'
import { IssueCardFooter } from '@/components/dashboard/IssueCardFooter'
import { IssueCardTags } from '@/components/dashboard/IssueCardTags'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { ScoredIssue } from '@/types/issue'

type IssueCardProps = {
  issue: ScoredIssue
}

export function IssueCard({ issue }: IssueCardProps) {
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

          <IssueCardTags
            difficultyLevel={issue.difficultyLevel}
            labels={issue.labels}
            language={issue.language}
          />

          <IssueCardFooter
            commentCount={issue.commentCount}
            competitionLevel={issue.competitionLevel}
            healthScore={issue.healthScore}
            stargazerCount={issue.stargazerCount}
            updatedAt={issue.updatedAt}
          />
        </CardContent>
      </Card>
    </a>
  )
}
