import { ExternalLink } from 'lucide-react'
import { IssueMetricsRow } from '@/components/shared/issue-card/IssueMetricsRow'
import { RepoHealthBadge } from '@/components/shared/issue-card/RepoHealthBadge'
import { IssueTagList } from '@/components/shared/issue-card/IssueTagList'
import { Badge } from '@/components/ui/badge'
import { DASHBOARD_HELP_DEMO_ISSUE } from '@/constants/dashboard-help'
import { formatTimeAgo } from '@/utils/format/time-ago'
import { getCompetitionMeta } from '@/lib/github/issue-badge-meta'
import { cn } from '@/lib/utils'
import { DashboardHelpHotspot } from './DashboardHelpHotspot'
import type { DashboardHelpGuideInteractionProps } from '@/types/dashboard'

const competition = getCompetitionMeta(DASHBOARD_HELP_DEMO_ISSUE.competitionLevel)

type DemoCardFooterProps = DashboardHelpGuideInteractionProps & {
  demoUpdatedAt: string
}

export function DemoCardFooter({
  activeGuideId,
  demoUpdatedAt,
  onActivateGuide,
  onClearGuide,
}: DemoCardFooterProps) {
  return (
    <div className="mt-auto flex flex-col gap-3 text-xs text-muted-foreground">
      <DashboardHelpHotspot
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
      </DashboardHelpHotspot>

      <DashboardHelpHotspot
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
  )
}
