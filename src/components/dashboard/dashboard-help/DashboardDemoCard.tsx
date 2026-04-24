import { HelpDemoCardFrame } from '@/components/help/HelpDemoCardFrame'
import type { DashboardHelpGuideInteractionProps } from '@/types/dashboard'
import { DashboardDemoCardFooter } from './DashboardDemoCardFooter'
import { DashboardDemoCardHeader } from './DashboardDemoCardHeader'

type DashboardHelpDemoCardProps = DashboardHelpGuideInteractionProps & {
  demoUpdatedAt: string
}

export function DashboardDemoCard({
  activeGuideId,
  demoUpdatedAt,
  onActivateGuide,
  onClearGuide,
}: DashboardHelpDemoCardProps) {
  return (
    <HelpDemoCardFrame>
      <DashboardDemoCardHeader
        activeGuideId={activeGuideId}
        onActivateGuide={onActivateGuide}
        onClearGuide={onClearGuide}
      />
      <DashboardDemoCardFooter
        activeGuideId={activeGuideId}
        demoUpdatedAt={demoUpdatedAt}
        onActivateGuide={onActivateGuide}
        onClearGuide={onClearGuide}
      />
    </HelpDemoCardFrame>
  )
}
