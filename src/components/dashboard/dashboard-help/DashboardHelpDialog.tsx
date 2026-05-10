'use client'

import { HelpDialogFrame } from '@/components/help/HelpDialogFrame'
import { HelpReportFooter } from '@/components/help/HelpReportFooter'
import {
  DASHBOARD_HELP_DEMO_UPDATED_OFFSET_MS,
  DASHBOARD_HELP_GUIDE_ITEMS,
  type DashboardHelpGuideId,
} from '@/constants/dashboard-help'
import { DashboardDemoCard } from './DashboardDemoCard'
import { DashboardScoringGuide } from './DashboardScoringGuide'

export function DashboardHelpDialog() {
  return (
    <HelpDialogFrame<DashboardHelpGuideId>
      demoUpdatedOffsetMs={DASHBOARD_HELP_DEMO_UPDATED_OFFSET_MS}
      guideItems={DASHBOARD_HELP_GUIDE_ITEMS}
      eyebrow="이슈 카드 안내"
      title="카드 구성과 추천 점수 산정 방식"
      titleId="dashboard-help-title"
      descriptionId="dashboard-help-description"
      footer={<HelpReportFooter />}
      renderDemoCardAction={(props) => <DashboardDemoCard {...props} />}
      primaryTabLabel="카드 읽는 법"
      extraTabs={[{ id: 'scoring', label: '점수 산정 방식', content: <DashboardScoringGuide /> }]}
    />
  )
}
