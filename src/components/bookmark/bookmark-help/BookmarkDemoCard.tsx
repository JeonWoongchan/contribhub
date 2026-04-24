import { HelpDemoCardFrame } from '@/components/help/HelpDemoCardFrame'
import type { BookmarkHelpGuideId } from '@/constants/bookmark-help'
import type { HelpGuideInteractionProps } from '@/types/help'
import { BookmarkDemoCardFooter } from './BookmarkDemoCardFooter'
import { BookmarkDemoCardHeader } from './BookmarkDemoCardHeader'

type BookmarkDemoCardProps = HelpGuideInteractionProps<BookmarkHelpGuideId> & {
  demoUpdatedAt: string
}

export function BookmarkDemoCard({
  activeGuideId,
  demoUpdatedAt,
  onActivateGuide,
  onClearGuide,
}: BookmarkDemoCardProps) {
  return (
    <HelpDemoCardFrame>
      <BookmarkDemoCardHeader
        activeGuideId={activeGuideId}
        onActivateGuide={onActivateGuide}
        onClearGuide={onClearGuide}
      />
      <BookmarkDemoCardFooter
        activeGuideId={activeGuideId}
        demoUpdatedAt={demoUpdatedAt}
        onActivateGuide={onActivateGuide}
        onClearGuide={onClearGuide}
      />
    </HelpDemoCardFrame>
  )
}
