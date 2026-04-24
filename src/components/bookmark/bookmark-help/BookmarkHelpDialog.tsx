'use client'

import { HelpDialogFrame } from '@/components/help/HelpDialogFrame'
import {
  BOOKMARK_HELP_DEMO_UPDATED_OFFSET_MS,
  BOOKMARK_HELP_GUIDE_ITEMS,
  type BookmarkHelpGuideId,
} from '@/constants/bookmark-help'
import { BookmarkDemoCard } from './BookmarkDemoCard'

export function BookmarkHelpDialog() {
  return (
    <HelpDialogFrame<BookmarkHelpGuideId>
      demoUpdatedOffsetMs={BOOKMARK_HELP_DEMO_UPDATED_OFFSET_MS}
      guideItems={BOOKMARK_HELP_GUIDE_ITEMS}
      eyebrow="북마크 읽는 법"
      title="북마크 카드를 이렇게 읽어보세요"
      titleId="bookmark-help-title"
      descriptionId="bookmark-help-description"
      renderDemoCard={(props) => <BookmarkDemoCard {...props} />}
    />
  )
}
