import { DASHBOARD_HELP_GUIDE_ITEMS } from '@/constants/dashboard-help'
import { cn } from '@/lib/utils'
import type { DashboardHelpGuideInteractionProps } from '@/types/dashboard'

export function DashboardHelpGuideList({
  activeGuideId,
  onActivateGuide,
  onClearGuide,
}: DashboardHelpGuideInteractionProps) {
  return (
    <div className="space-y-3">
      {DASHBOARD_HELP_GUIDE_ITEMS.map((item, index) => (
        <DashboardHelpGuideListItem
          key={item.id}
          index={index}
          item={item}
          isActive={item.id === activeGuideId}
          onActivateGuide={onActivateGuide}
          onClearGuide={onClearGuide}
        />
      ))}
    </div>
  )
}

type DashboardHelpGuideListItemProps = Pick<
  DashboardHelpGuideInteractionProps,
  'onActivateGuide' | 'onClearGuide'
> & {
  index: number
  item: (typeof DASHBOARD_HELP_GUIDE_ITEMS)[number]
  isActive: boolean
}

function DashboardHelpGuideListItem({
  index,
  item,
  isActive,
  onActivateGuide,
  onClearGuide,
}: DashboardHelpGuideListItemProps) {
  return (
    <button
      type="button"
      onMouseEnter={() => onActivateGuide(item.id)}
      onMouseLeave={onClearGuide}
      onFocus={() => onActivateGuide(item.id)}
      onBlur={onClearGuide}
      className={cn(
        'block w-full rounded-xl border bg-card/60 p-4 text-left outline-none transition-all',
        'focus-visible:ring-2 focus-visible:ring-interactive-selected-ring/60',
        isActive
          ? 'scale-[1.01] border-border bg-interactive-selected/45 shadow-lg'
          : 'border-border hover:border-interactive-selected-border/70 hover:bg-card'
      )}
    >
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors',
            isActive
              ? 'bg-interactive-action text-interactive-action-foreground'
              : 'bg-interactive-selected text-interactive-selected-foreground'
          )}
        >
          {index + 1}
        </span>
        <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
      </div>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
    </button>
  )
}
