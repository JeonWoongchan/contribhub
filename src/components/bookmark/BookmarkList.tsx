'use client'

import Link from 'next/link'
import { IssueListContent } from '@/components/dashboard/issue/IssueListContent'
import { DataListState } from '@/components/shared/DataListState'
import { useBookmarkList } from '@/hooks/useBookmarkList'
import { useIssueBookmarks } from '@/hooks/useIssueBookmarks'

export function BookmarkList() {
  const bookmarkListState = useBookmarkList()
  const { optimisticIssues, pendingBookmarkKeys, toggleBookmark } = useIssueBookmarks({
    sourceIssues: bookmarkListState.status === 'done' ? bookmarkListState.issues : [],
    isSourceIssuesReady: bookmarkListState.status === 'done',
  })

  return (
    <DataListState
      status={bookmarkListState.status}
      items={bookmarkListState.status === 'done' ? optimisticIssues : []}
      errorMessage={bookmarkListState.status === 'error' ? bookmarkListState.message : undefined}
      onRetry={bookmarkListState.refetch}
      skeletonCount={4}
      emptyTitle="저장한 북마크가 없습니다"
      emptyDescription="대시보드에서 관심 있는 이슈를 저장하면 여기에서 북마크 목록을 확인할 수 있습니다."
      emptyDetail="추천 이슈 페이지에서 관심 있는 이슈를 북마크로 추가해보세요."
      emptyAction={<Link href="/dashboard">추천 이슈 보러가기</Link>}
      renderContent={(loadedIssues) => (
        <IssueListContent
          issues={loadedIssues}
          partial={false}
          failedCount={0}
          pendingBookmarkKeys={pendingBookmarkKeys}
          onToggleBookmark={toggleBookmark}
        />
      )}
    />
  )
}
