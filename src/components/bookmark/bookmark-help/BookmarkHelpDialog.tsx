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
      eyebrow="도움말"
      title="Q. 북마크 이슈 카드에 데이터가 뜨지 않아요."
      titleId="bookmark-help-title"
      descriptionId="bookmark-help-description"
      renderDemoCard={(props) => <BookmarkDemoCard {...props} />}
    />
  )
}
