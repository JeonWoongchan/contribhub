import { HelpHotspot } from '@/components/help/HelpHotspot'
import { BOOKMARK_HELP_DEMO_ISSUE } from '@/constants/bookmark-help'
import type { BookmarkHelpGuideId } from '@/constants/bookmark-help'
import type { HelpGuideInteractionProps } from '@/types/help'

type BookmarkDemoCardHeaderProps = HelpGuideInteractionProps<BookmarkHelpGuideId>

export function BookmarkDemoCardHeader({
  activeGuideId,
  onActivateGuide,
  onClearGuide,
}: BookmarkDemoCardHeaderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <span className="truncate text-xs text-muted-foreground">
          {BOOKMARK_HELP_DEMO_ISSUE.repoFullName}
        </span>
      </div>

      <HelpHotspot
        guideId="still-usable"
        activeGuideId={activeGuideId}
        onActivateGuide={onActivateGuide}
        onClearGuide={onClearGuide}
        className="rounded-lg"
      >
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-card-foreground">
          {BOOKMARK_HELP_DEMO_ISSUE.title}
        </h3>
      </HelpHotspot>
    </div>
  )
}
