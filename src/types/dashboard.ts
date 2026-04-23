import type { DashboardHelpGuideId } from '@/constants/dashboard-help'

export type DashboardHelpGuideInteractionProps = {
  activeGuideId: DashboardHelpGuideId | null
  onActivateGuide: (guideId: DashboardHelpGuideId) => void
  onClearGuide: () => void
}
