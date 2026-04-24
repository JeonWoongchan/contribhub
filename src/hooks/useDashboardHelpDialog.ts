'use client'

import { DASHBOARD_HELP_DEMO_UPDATED_OFFSET_MS } from '@/constants/dashboard-help'
import type { DashboardHelpGuideId } from '@/constants/dashboard-help'
import { useHelpDialog } from '@/hooks/useHelpDialog'

type UseDashboardHelpDialogState = {
  isOpen: boolean
  activeGuideId: DashboardHelpGuideId | null
  demoUpdatedAt: string
  openDialog: () => void
  closeDialog: () => void
  activateGuide: (guideId: DashboardHelpGuideId) => void
  clearActiveGuide: () => void
}

export function useDashboardHelpDialog(): UseDashboardHelpDialogState {
  return useHelpDialog<DashboardHelpGuideId>(DASHBOARD_HELP_DEMO_UPDATED_OFFSET_MS)
}
