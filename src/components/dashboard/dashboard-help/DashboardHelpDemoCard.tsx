import { ExternalLink, MessageCircle, Star, Zap } from 'lucide-react'
import { RepoHealthBadge } from '@/components/dashboard/issue/RepoHealthBadge'
import { IssueCardTags } from '@/components/dashboard/issue/IssueCardTags'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { DASHBOARD_HELP_DEMO_ISSUE } from '@/constants/dashboard-help'
import { formatTimeAgo } from '@/lib/format/time-ago'
import { getCompetitionMeta } from '@/lib/github/issue-badge-meta'
import { cn } from '@/lib/utils'
import { DashboardHelpHotspot } from './DashboardHelpHotspot'
import type { DashboardHelpGuideInteractionProps } from '@/types/dashboard'

const competition = getCompetitionMeta(DASHBOARD_HELP_DEMO_ISSUE.competitionLevel)

type DashboardHelpDemoCardProps = DashboardHelpGuideInteractionProps & {
  demoUpdatedAt: string
}

export function DashboardHelpDemoCard({
  activeGuideId,
  demoUpdatedAt,
  onActivateGuide,
  onClearGuide,
}: DashboardHelpDemoCardProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-muted-foreground">예시 카드</p>
      <Card
        size="sm"
        className="border border-border py-4 shadow-[0_0_0_1px_var(--color-interactive-selected-border)]"
      >
        <CardContent className="flex h-full flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <span className="truncate text-xs text-muted-foreground">
              {DASHBOARD_HELP_DEMO_ISSUE.repoFullName}
            </span>
            <DashboardHelpHotspot
              guideId="score"
              activeGuideId={activeGuideId}
              onActivateGuide={onActivateGuide}
              onClearGuide={onClearGuide}
              className="rounded-lg"
            >
              <Badge
                variant="outline"
                className="shrink-0 rounded-md border-transparent bg-interactive-action text-interactive-action-foreground"
              >
                <Zap className="h-3 w-3" />
                <span className="tabular-nums">{DASHBOARD_HELP_DEMO_ISSUE.score}</span>
              </Badge>
            </DashboardHelpHotspot>
          </div>

          <h3 className="line-clamp-2 text-sm font-medium leading-snug text-card-foreground">
            {DASHBOARD_HELP_DEMO_ISSUE.title}
          </h3>

          <DashboardHelpHotspot
            guideId="stack"
            activeGuideId={activeGuideId}
            onActivateGuide={onActivateGuide}
            onClearGuide={onClearGuide}
            className="rounded-xl"
          >
            <IssueCardTags
              difficultyLevel={DASHBOARD_HELP_DEMO_ISSUE.difficultyLevel}
              labels={DASHBOARD_HELP_DEMO_ISSUE.labels}
              language={DASHBOARD_HELP_DEMO_ISSUE.language}
            />
          </DashboardHelpHotspot>

          <div className="mt-auto flex flex-col gap-3 text-xs text-muted-foreground">
            <DashboardHelpHotspot
              guideId="metrics"
              activeGuideId={activeGuideId}
              onActivateGuide={onActivateGuide}
              onClearGuide={onClearGuide}
              className="rounded-xl"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {DASHBOARD_HELP_DEMO_ISSUE.stargazerCount.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  {DASHBOARD_HELP_DEMO_ISSUE.commentCount}
                </span>
              </div>
            </DashboardHelpHotspot>

            <div className="flex flex-wrap items-center gap-2">
              <DashboardHelpHotspot
                guideId="health"
                activeGuideId={activeGuideId}
                onActivateGuide={onActivateGuide}
                onClearGuide={onClearGuide}
                className="rounded-xl"
              >
                <RepoHealthBadge score={DASHBOARD_HELP_DEMO_ISSUE.healthScore} />
              </DashboardHelpHotspot>

              <DashboardHelpHotspot
                guideId="competition"
                activeGuideId={activeGuideId}
                onActivateGuide={onActivateGuide}
                onClearGuide={onClearGuide}
                className="rounded-xl"
              >
                <Badge variant="outline" className={cn('rounded-md', competition.className)}>
                  {competition.label}
                </Badge>
              </DashboardHelpHotspot>

              <span className="text-interactive-action-hover">{formatTimeAgo(demoUpdatedAt)}</span>
              <ExternalLink className="ml-auto h-3 w-3 text-interactive-action opacity-70" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-dashed border-interactive-selected-border/70 bg-interactive-selected/30 p-4 text-sm text-muted-foreground">
        카드 요소에 마우스를 올리면 오른쪽 설명도 같이 강조됩니다.
      </div>
    </div>
  )
}
