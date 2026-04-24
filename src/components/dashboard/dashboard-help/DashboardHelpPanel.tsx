import { DashboardHelpDemoCard } from './DashboardHelpDemoCard'
import { DashboardHelpGuideList } from './DashboardHelpGuideList'
import { DashboardHelpHeader } from './DashboardHelpHeader'
import type { DashboardHelpGuideInteractionProps } from '@/types/dashboard'

type DashboardHelpPanelProps = DashboardHelpGuideInteractionProps & {
  demoUpdatedAt: string
  onClose: () => void
}

export function DashboardHelpPanel({
  activeGuideId,
  demoUpdatedAt,
  onActivateGuide,
  onClearGuide,
  onClose,
}: DashboardHelpPanelProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dashboard-help-title"
      aria-describedby="dashboard-help-description"
      className="w-full max-w-4xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
      onClick={(event) => event.stopPropagation()}
    >
      <DashboardHelpHeader onClose={onClose} />

      <div className="grid gap-6 px-5 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <DashboardHelpDemoCard
          activeGuideId={activeGuideId}
          demoUpdatedAt={demoUpdatedAt}
          onActivateGuide={onActivateGuide}
          onClearGuide={onClearGuide}
        />
        <DashboardHelpGuideList
          activeGuideId={activeGuideId}
          onActivateGuide={onActivateGuide}
          onClearGuide={onClearGuide}
        />
      </div>
    </div>
  )
}
