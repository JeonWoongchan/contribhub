'use client'

import { HelpDialogFrame } from '@/components/help/HelpDialogFrame'
import {
  DASHBOARD_HELP_DEMO_UPDATED_OFFSET_MS,
  DASHBOARD_HELP_GUIDE_ITEMS,
  type DashboardHelpGuideId,
} from '@/constants/dashboard-help'
import { DashboardDemoCard } from './DashboardDemoCard'

export function DashboardHelpDialog() {
  return (
    <HelpDialogFrame<DashboardHelpGuideId>
      demoUpdatedOffsetMs={DASHBOARD_HELP_DEMO_UPDATED_OFFSET_MS}
      guideItems={DASHBOARD_HELP_GUIDE_ITEMS}
      eyebrow="도움말"
      title="Q. 이슈 카드의 요소들은 무엇을 의미하나요?"
      titleId="dashboard-help-title"
      descriptionId="dashboard-help-description"
      renderDemoCard={(props) => <DashboardDemoCard {...props} />}
    />
  )
}
