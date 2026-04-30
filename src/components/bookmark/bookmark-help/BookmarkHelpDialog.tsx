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
      title="Q. 북마크 이슈 카드의 데이터가 왜 비어 있나요?"
      titleId="bookmark-help-title"
      descriptionId="bookmark-help-description"
      footer={
        <p>
          북마크 이슈의 추천 점수는 현재 온보딩 답변 기준으로 계산됩니다. 온보딩을 다시 수정하면
          북마크 목록의 추천 점수도 함께 달라질 수 있습니다.
        </p>
      }
      renderDemoCardAction={(props) => <BookmarkDemoCard {...props} />}
    />
  )
}
