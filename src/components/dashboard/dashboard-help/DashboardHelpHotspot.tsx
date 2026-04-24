import type { ReactNode } from 'react'
import type { DashboardHelpGuideId } from '@/constants/dashboard-help'
import { cn } from '@/lib/utils'
import type { DashboardHelpGuideInteractionProps } from '@/types/dashboard'

type DashboardHelpHotspotProps = DashboardHelpGuideInteractionProps & {
  guideId: DashboardHelpGuideId
  className?: string
  children: ReactNode
}

export function DashboardHelpHotspot({
  guideId,
  activeGuideId,
  onActivateGuide,
  onClearGuide,
  className,
  children,
}: DashboardHelpHotspotProps) {
  const isActive = guideId === activeGuideId

  return (
    <button
      type="button"
      onMouseEnter={() => onActivateGuide(guideId)}
      onMouseLeave={onClearGuide}
      onFocus={() => onActivateGuide(guideId)}
      onBlur={onClearGuide}
      className={cn(
        'inline-flex w-fit text-left outline-none transition-all',
        'focus-visible:ring-2 focus-visible:ring-interactive-selected-ring/60',
        className,
        isActive && 'scale-[1.03] bg-interactive-selected/30 shadow-lg'
      )}
    >
      {children}
    </button>
  )
}
