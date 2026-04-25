import { IssueScoreBadge } from '@/components/shared/issue-card/IssueScoreBadge'
import { DASHBOARD_HELP_DEMO_ISSUE } from '@/constants/dashboard-help'
import { DashboardHelpHotspot } from './DashboardHelpHotspot'
import type { DashboardHelpGuideInteractionProps } from '@/types/dashboard'

export function DemoCardHeader({
  activeGuideId,
  onActivateGuide,
  onClearGuide,
}: DashboardHelpGuideInteractionProps) {
  return (
    <>
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
          <IssueScoreBadge score={DASHBOARD_HELP_DEMO_ISSUE.score} />
        </DashboardHelpHotspot>
      </div>

      <h3 className="line-clamp-2 text-sm font-medium leading-snug text-card-foreground">
        {DASHBOARD_HELP_DEMO_ISSUE.title}
      </h3>
    </>
  )
}
