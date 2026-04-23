'use client'

import { useDashboardHelpDialog } from '@/hooks/useDashboardHelpDialog'
import { DashboardHelpPanel } from './DashboardHelpPanel'
import { DashboardHelpTrigger } from './DashboardHelpTrigger'

export function DashboardHelpDialog() {
  const {
    isOpen,
    activeGuideId,
    demoUpdatedAt,
    openDialog,
    closeDialog,
    activateGuide,
    clearActiveGuide,
  } = useDashboardHelpDialog()

  return (
    <>
      <DashboardHelpTrigger onOpen={openDialog} />

      {isOpen ? (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-sm"
            onClick={closeDialog}
            role="presentation"
          >
            <DashboardHelpPanel
              activeGuideId={activeGuideId}
              demoUpdatedAt={demoUpdatedAt}
              onActivateGuide={activateGuide}
              onClearGuide={clearActiveGuide}
              onClose={closeDialog}
            />
          </div>
      ) : null}
    </>
  )
}
