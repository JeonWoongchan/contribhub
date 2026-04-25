import { HelpHotspot } from '@/components/help/HelpHotspot'
import { IssueMetricsRow } from '@/components/shared/issue-card/IssueMetricsRow'
import { RepoHealthBadge } from '@/components/shared/issue-card/RepoHealthBadge'
import { IssueTagList } from '@/components/shared/issue-card/IssueTagList'
import { Badge } from '@/components/ui/badge'
import { DASHBOARD_HELP_DEMO_ISSUE } from '@/constants/dashboard-help'
import { formatTimeAgo } from '@/lib/format/time-ago'
import { getCompetitionMeta } from '@/lib/github/issue-badge-meta'
import { cn } from '@/lib/utils'
import type { DashboardHelpGuideInteractionProps } from '@/types/dashboard'

const competition = getCompetitionMeta(DASHBOARD_HELP_DEMO_ISSUE.competitionLevel)

type DemoCardFooterProps = DashboardHelpGuideInteractionProps & {
  demoUpdatedAt: string
}

export function DashboardDemoCardFooter({
  activeGuideId,
  demoUpdatedAt,
  onActivateGuide,
  onClearGuide,
}: DemoCardFooterProps) {
  return (
    <div className="mt-auto flex flex-col gap-3 text-xs text-muted-foreground">
      <HelpHotspot
        guideId="stack"
        activeGuideId={activeGuideId}
        onActivateGuide={onActivateGuide}
        onClearGuide={onClearGuide}
        className="rounded-xl"
      >
        <IssueTagList
          difficultyLevel={DASHBOARD_HELP_DEMO_ISSUE.difficultyLevel}
          labels={DASHBOARD_HELP_DEMO_ISSUE.labels}
          language={DASHBOARD_HELP_DEMO_ISSUE.language}
        />
      </HelpHotspot>

      <HelpHotspot
        guideId="metrics"
        activeGuideId={activeGuideId}
        onActivateGuide={onActivateGuide}
        onClearGuide={onClearGuide}
        className="rounded-xl"
      >
        <IssueMetricsRow
          commentCount={DASHBOARD_HELP_DEMO_ISSUE.commentCount}
          stargazerCount={DASHBOARD_HELP_DEMO_ISSUE.stargazerCount}
        />
      </HelpHotspot>

      <div className="flex flex-wrap items-center gap-2">
        <HelpHotspot
          guideId="health"
          activeGuideId={activeGuideId}
          onActivateGuide={onActivateGuide}
          onClearGuide={onClearGuide}
          className="rounded-xl"
        >
          <RepoHealthBadge score={DASHBOARD_HELP_DEMO_ISSUE.healthScore} />
        </HelpHotspot>

        <HelpHotspot
          guideId="competition"
          activeGuideId={activeGuideId}
          onActivateGuide={onActivateGuide}
          onClearGuide={onClearGuide}
          className="rounded-xl"
        >
          <Badge variant="outline" className={cn('rounded-md', competition.className)}>
            {competition.label}
          </Badge>
        </HelpHotspot>

        <span className="text-interactive-action-hover">{formatTimeAgo(demoUpdatedAt)}</span>
      </div>
    </div>
  )
}
