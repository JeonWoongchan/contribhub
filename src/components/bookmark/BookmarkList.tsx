'use client'

import Link from 'next/link'
import { SearchBar } from '@/components/shared/SearchBar'
import { SearchDataListState } from '@/components/shared/SearchDataListState'
import { BookmarkHelpDialog } from '@/components/bookmark/bookmark-help/BookmarkHelpDialog'
import { useBookmarkList } from '@/hooks/useBookmarkList'
import { useIssueBookmarks } from '@/hooks/useIssueBookmarks'
import { useListSearch } from '@/hooks/useListSearch'
import { BookmarkListContent } from './BookmarkListContent'

export function BookmarkList() {
  const { issues, isPending, isError, errorMessage, refetch } = useBookmarkList()
  const { optimisticIssues, pendingBookmarkKeys, toggleBookmark } = useIssueBookmarks({
    sourceIssues: issues,
    isSourceIssuesReady: !isPending && !isError,
    removeOnUnbookmark: true,
    onMutationSuccessAction: refetch,
  })
  const { query, setQuery, filteredItems, visibleItems, sentinelRef, hasMore, resultCount } =
    useListSearch(optimisticIssues)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <SearchBar value={query} onChange={setQuery} resultCount={resultCount} className="flex-1" />
        <BookmarkHelpDialog />
      </div>
      <SearchDataListState
        query={query}
        entityLabel="북마크"
        fallback={{
          title: '저장한 북마크가 없습니다',
          description: '대시보드에서 관심 있는 이슈를 저장하면 여기에서 북마크 목록을 확인할 수 있습니다.',
          detail: '추천 이슈 페이지에서 관심 있는 이슈를 북마크로 추가해 보세요.',
          action: <Link href="/dashboard">추천 이슈 보러가기</Link>,
        }}
        isPending={isPending}
        isError={isError}
        items={filteredItems}
        errorMessage={errorMessage}
        onRetry={refetch}
        skeletonCount={6}
        renderContent={() => (
          <BookmarkListContent
            issues={visibleItems}
            pendingBookmarkKeys={pendingBookmarkKeys}
            onToggleBookmark={toggleBookmark}
          />
        )}
      />
      {hasMore && <div ref={sentinelRef} className="h-10" />}
    </div>
  )
}
