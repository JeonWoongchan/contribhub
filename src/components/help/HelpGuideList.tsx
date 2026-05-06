import { cn } from '@/lib/utils'
import type { HelpGuideItem, HelpGuideInteractionProps } from '@/types/help'

type HelpGuideListProps<TGuideId extends string> = HelpGuideInteractionProps<TGuideId> & {
  items: readonly HelpGuideItem<TGuideId>[]
}

// 도움말 다이얼로그 우측 가이드 항목 목록.
// HelpHotspot과 activeGuideId를 공유해 항목 hover 시 좌측 데모 카드도 동시에 강조.
export function HelpGuideList<TGuideId extends string>({
  items,
  activeGuideId,
  onActivateGuide,
  onClearGuide,
}: HelpGuideListProps<TGuideId>) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isActive = item.id === activeGuideId

        return (
          <button
            key={item.id}
            type="button"
            onMouseEnter={() => onActivateGuide(item.id)}
            onMouseLeave={onClearGuide}
            onFocus={() => onActivateGuide(item.id)}
            onBlur={onClearGuide}
            className={cn(
              'block w-full rounded-xl border bg-card/60 p-4 text-left outline-none transition-all',
              'focus-visible:ring-2 focus-visible:ring-interactive-selected-ring/60',
              isActive
                ? 'border-border bg-interactive-selected/45 shadow-lg'
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
      })}
    </div>
  )
}
