import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { HelpGuideInteractionProps } from '@/types/help'

type HelpHotspotProps<TGuideId extends string> = HelpGuideInteractionProps<TGuideId> & {
  guideId: TGuideId
  className?: string
  children: ReactNode
}

export function HelpHotspot<TGuideId extends string>({
  guideId,
  activeGuideId,
  onActivateGuide,
  onClearGuide,
  className,
  children,
}: HelpHotspotProps<TGuideId>) {
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
