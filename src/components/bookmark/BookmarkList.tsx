'use client'

import Link from 'next/link'
import { DataListState } from '@/components/shared/DataListState'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { useBookmarkList } from '@/hooks/useBookmarkList'
import { useIssueBookmarks } from '@/hooks/useIssueBookmarks'
import { BookmarkListContent } from './BookmarkListContent'

export function BookmarkList() {
  const { issues, isPending, isError, errorMessage, refetch } = useBookmarkList()
  const { optimisticIssues, pendingBookmarkKeys, toggleBookmark } = useIssueBookmarks({
    sourceIssues: issues,
    isSourceIssuesReady: !isPending && !isError,
    removeOnUnbookmark: true,
    onMutationSuccessAction: refetch,
  })
  const { visibleItems, sentinelRef, hasMore } = useInfiniteScroll(optimisticIssues)

  return (
    <>
      <DataListState
        isPending={isPending}
        isError={isError}
        items={optimisticIssues}
        errorMessage={errorMessage}
        onRetry={refetch}
        skeletonCount={6}
        emptyTitle="저장한 북마크가 없습니다"
        emptyDescription="대시보드에서 관심 있는 이슈를 저장하면 여기에서 북마크 목록을 확인할 수 있습니다."
        emptyDetail="추천 이슈 페이지에서 관심 있는 이슈를 북마크로 추가해 보세요."
        emptyAction={<Link href="/dashboard">추천 이슈 보러가기</Link>}
        renderContent={() => (
          <BookmarkListContent
            issues={visibleItems}
            pendingBookmarkKeys={pendingBookmarkKeys}
            onToggleBookmark={toggleBookmark}
          />
        )}
      />
      {hasMore && <div ref={sentinelRef} className="h-10" />}
    </>
  )
}
